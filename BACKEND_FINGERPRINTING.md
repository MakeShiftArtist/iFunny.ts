# iFunny Backend Fingerprinting Research

Techniques for passively and low-impact identifying the backend stack behind `api.ifunny.mobi/v4`.

---

## 1. Confirmed Stack Intelligence (from Job Postings)

FunCorp job postings for iFunny backend roles reveal the actual stack:

- **Languages:** Java / Kotlin
- **Frameworks:** Spring Framework, Dropwizard, Ktor
- **Databases:** MongoDB, Redis, Clickhouse, Elasticsearch, Memcached
- **Messaging:** Kafka
- **Infrastructure:** Docker, Kubernetes, Jenkins, GitLab CI
- **Data/ML:** Spark, Airflow
- **Other backends:** PHP (Symfony), Python (Flask/Gunicorn, Asyncio)
- **Frontend infra:** Cloudflare CDN, NGINX

Key requirements from the "Senior Java/Kotlin Backend Developer (iFunny)" posting explicitly state: *"Extensive experience in backend development in Java / Kotlin + MongoDB + Spring Framework."*

This confirms the Java hypothesis and narrows the target to **Spring Framework on MongoDB** as the primary API backend.

**Sources:**
- [FunCorp Senior Java/Kotlin Backend Developer (iFunny) - getmatch.ru](https://getmatch.ru/vacancies/11282-senior-java-kotlin-backend-developer)
- [Middle Backend Developer (Kotlin) at FUNCORP - remocate.app](https://www.remocate.app/jobs/middle-backend-developer-kotlin)
- [FunCorp - funcorp.dev](https://funcorp.dev/)

---

## 2. HTTP Header Fingerprinting

### 2.1 Headers That Leak Stack Info

| Header | What It Reveals | Default Behavior |
|--------|----------------|-----------------|
| `Server` | Servlet container identity | Tomcat <8.5: `Apache-Coyote/1.1`. Tomcat 8.5+: not set. Jetty: `Jetty(9.x.x.vXXXX)` |
| `X-Powered-By` | Servlet/JSP spec versions + full Tomcat version + JVM info | Disabled by default on Tomcat, but if enabled: `Servlet/3.1 JSP/2.3 (Apache Tomcat/8.0.xx Java/Oracle Corporation/1.8.0_xxx)` |
| `X-Application-Context` | Spring Boot app name, profile, internal port | e.g., `application:prod:8080`. Added by Spring Boot Actuator's filter. Disabled with `management.add-application-context-header=false` |
| `X-Content-Type-Options` | If `nosniff` — suggests Spring Security | Spring Security adds this by default |
| `X-Frame-Options` | If `DENY` or `SAMEORIGIN` — suggests Spring Security | Spring Security default |
| `Content-Type` | `application/problem+json` on errors = Spring 6+ / Boot 3+ | RFC 9457 support added in Spring 6 |

### 2.2 Practical Commands

```bash
# Grab all response headers from the API root
curl -sI https://api.ifunny.mobi/v4/ 2>&1

# Grab headers from a known endpoint
curl -sI https://api.ifunny.mobi/v4/feeds/featured 2>&1

# Check for X-Application-Context (Spring Boot fingerprint)
curl -s -D- -o /dev/null https://api.ifunny.mobi/v4/ | grep -i 'x-application-context'

# Force a 404 and inspect headers
curl -sI https://api.ifunny.mobi/v4/nonexistent_path_12345 2>&1

# Force a 405 Method Not Allowed
curl -sI -X DELETE https://api.ifunny.mobi/v4/feeds/featured 2>&1

# Send malformed content-type to provoke framework-specific error
curl -s -X POST https://api.ifunny.mobi/v4/oauth2/token \
  -H "Content-Type: text/plain" \
  -d "garbage" 2>&1
```

### 2.3 Nmap Scripts

```bash
# Extract Server header
nmap -p 443 --script http-server-header api.ifunny.mobi

# Dump all HTTP response headers
nmap -p 443 --script http-headers api.ifunny.mobi

# Enumerate known paths (servlets, actuator endpoints, etc.)
nmap -p 443 --script http-enum api.ifunny.mobi

# Advanced web server fingerprinting
# (requires: https://github.com/scipag/httprecon-nse)
nmap -p 443 --script httprecon api.ifunny.mobi
```

**Sources:**
- [Apache Tomcat 8 Security Considerations](https://tomcat.apache.org/tomcat-8.0-doc/security-howto.html)
- [Jetty Version Disclosure - TIBCO](https://support.tibco.com/external/article?articleUrl=How-to-disabled-jetty-server-version-details-from-http-response-header)
- [X-Application-Context Issue #1308 - Spring Boot](https://github.com/spring-projects/spring-boot/issues/1308)
- [httprecon-nse - Advanced Web Server Fingerprinting](https://github.com/scipag/httprecon-nse)
- [http-server-header NSE Script](https://nmap.org/nsedoc/scripts/http-server-header.html)

---

## 3. Error Page / Error Response Fingerprinting

### 3.1 Spring Boot Default JSON Error Response

Spring Boot's `BasicErrorController` produces a distinctive error JSON:

```json
{
  "timestamp": "2024-12-15T12:34:56.789+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "No message available",
  "path": "/v4/nonexistent"
}
```

**Version-discriminating fields:**
- **Spring Boot 1.x:** `timestamp` is a raw epoch integer (e.g., `1702644896789`)
- **Spring Boot 2.0-2.2:** `timestamp` is ISO 8601 string; `message` and `exception` fields present
- **Spring Boot 2.3+:** `message` and `exception` hidden by default (security hardening)
- **Spring Boot 3+ (Spring 6):** If `spring.mvc.problemdetails.enabled=true`, switches to RFC 9457 format with `type`, `title`, `status`, `detail`, `instance` fields and `Content-Type: application/problem+json`

### 3.2 Whitelabel Error Page (HTML)

If the API accidentally serves HTML errors, look for the Spring Boot Whitelabel Error Page:

```
Whitelabel Error Page
This application has no explicit mapping for /error, so you are seeing this as a fallback.
```

**Shodan dork:** `http.title:"Whitelabel Error Page" hostname:ifunny.mobi`

### 3.3 Servlet Container Error Pages

| Container | 404 Pattern | Identifying String |
|-----------|-------------|-------------------|
| **Tomcat** | `<h1>HTTP Status 404</h1>` with version in footer | `Apache Tomcat/X.X.X` |
| **Jetty** | `<h2>Error 404 - Not Found.</h2>` | `Powered by Eclipse Jetty:// Server` |
| **Undertow** | Minimal/empty body | Almost no HTML — very terse responses |

### 3.4 Practical Commands

```bash
# Request non-existent path with Accept: text/html to get HTML error page
curl -s https://api.ifunny.mobi/v4/does_not_exist \
  -H "Accept: text/html"

# Request with Accept: application/json to get JSON error body
curl -s https://api.ifunny.mobi/v4/does_not_exist \
  -H "Accept: application/json" | python3 -m json.tool

# Trigger 500 with malformed body
curl -s -X POST https://api.ifunny.mobi/v4/oauth2/token \
  -H "Content-Type: application/json" \
  -d '{invalid json' | python3 -m json.tool

# Check if error response uses RFC 9457 Problem Details
curl -s -D- https://api.ifunny.mobi/v4/does_not_exist | head -20
```

**Sources:**
- [0xdf Default 404 Pages Cheat Sheet](https://0xdf.gitlab.io/cheatsheets/404)
- [Spring Boot REST API Error Handling - Toptal](https://www.toptal.com/java/spring-boot-rest-api-error-handling)
- [Spring Boot Default Error Handling - mkyong.com](https://mkyong.com/spring-boot/spring-rest-error-handling-example/)
- [WhiteLabel Error Page / Spring Boot Actuators Hunting](https://0xshuvo.medium.com/whitelevel-error-page-spring-boot-actuators-hunting-b0290c4ccdbd)

---

## 4. Spring Boot Actuator Endpoint Discovery

If actuator endpoints are exposed (common misconfiguration), they are the single strongest fingerprint.

### 4.1 Endpoints to Probe

```bash
# Discovery page (lists all enabled actuator endpoints)
curl -s https://api.ifunny.mobi/v4/actuator | python3 -m json.tool
curl -s https://api.ifunny.mobi/actuator | python3 -m json.tool

# Health check (most commonly exposed)
curl -s https://api.ifunny.mobi/v4/actuator/health
# Response: {"status":"UP"} confirms Spring Boot

# Info endpoint (may leak build info, git commit, Java version)
curl -s https://api.ifunny.mobi/v4/actuator/info

# Environment (sanitized in Boot 3+, but confirms Spring)
curl -s https://api.ifunny.mobi/v4/actuator/env

# Also try common alternate base paths
for path in actuator manage management admin health info; do
  echo "--- /$path ---"
  curl -s -o /dev/null -w "%{http_code}" "https://api.ifunny.mobi/$path"
  echo
  curl -s -o /dev/null -w "%{http_code}" "https://api.ifunny.mobi/v4/$path"
  echo
done
```

### 4.2 Fingerprint via Content-Type

Actuator endpoints return a distinctive content type:
```
Content-Type: application/vnd.spring-boot.actuator.v3+json
```

This is an unambiguous Spring Boot identifier. Even a `403 Forbidden` with this content type confirms the stack.

**Sources:**
- [Spring Boot Actuator Endpoints Documentation](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)
- [Spring Boot Actuator - Baeldung](https://www.baeldung.com/spring-boot-actuators)
- [Securely Using Spring Boot Actuator - SYSCREST](https://www.syscrest.com/2025/02/securing-spring-boot-actuator/)

---

## 5. API Behavioral Fingerprinting

### 5.1 Trailing Slash Handling

Spring Framework's behavior changed across versions:
- **Spring 5 / Boot 2:** `/v4/feeds/featured` and `/v4/feeds/featured/` both resolve (trailing slash match = true by default)
- **Spring 6 / Boot 3:** `/v4/feeds/featured/` returns 404 (trailing slash match deprecated and disabled)

```bash
# Compare responses — version-discriminating
curl -s -o /dev/null -w "%{http_code}" https://api.ifunny.mobi/v4/feeds/featured
curl -s -o /dev/null -w "%{http_code}" https://api.ifunny.mobi/v4/feeds/featured/
# If both return 200: likely Spring 5 / Boot 2
# If second returns 404: likely Spring 6 / Boot 3
```

### 5.2 HTTP Method Override

Spring MVC supports `HiddenHttpMethodFilter` which honors `X-HTTP-Method-Override`:

```bash
# Send POST with method override header
curl -s -X POST https://api.ifunny.mobi/v4/feeds/featured \
  -H "X-HTTP-Method-Override: GET" \
  -D- -o /dev/null
# If this returns the same result as GET: Spring's HiddenHttpMethodFilter is active
```

### 5.3 Malformed JSON Handling

Spring + Jackson produces distinctive errors:

```bash
# Send invalid JSON
curl -s -X POST https://api.ifunny.mobi/v4/oauth2/token \
  -H "Content-Type: application/json" \
  -d '{"broken":}'

# Look for Jackson-specific markers in the response:
# - "com.fasterxml.jackson.core.JsonParseException"
# - "JSON parse error"
# - "HttpMessageNotReadableException"
# - "Malformed JSON request"
```

### 5.4 Content-Type Mismatch

```bash
# Send XML content-type to a JSON API
curl -s -X POST https://api.ifunny.mobi/v4/oauth2/token \
  -H "Content-Type: application/xml" \
  -d "<root/>"
# Spring returns 415 Unsupported Media Type with specific wording

# Send no content-type
curl -s -X POST https://api.ifunny.mobi/v4/oauth2/token \
  -d "test=value"
# Different frameworks handle missing Content-Type differently
```

### 5.5 HTTP Parameter Pollution

Java Servlet API (`getParameter()`) returns the **first** value for duplicate params. Spring MVC follows this for `String` params but collects all values for `String[]`/`List<String>`.

```bash
# Duplicate parameter test
curl -s "https://api.ifunny.mobi/v4/feeds/featured?limit=10&limit=999"
# If limit=10 is used: standard Servlet behavior (first wins)
# If limit=999 is used: non-Java (PHP uses last)
# If error: strict validation
```

### 5.6 Path Sensitivity

```bash
# Case sensitivity test (Java/Spring is case-sensitive by default)
curl -s -o /dev/null -w "%{http_code}" https://api.ifunny.mobi/v4/feeds/featured
curl -s -o /dev/null -w "%{http_code}" https://api.ifunny.mobi/v4/Feeds/Featured
curl -s -o /dev/null -w "%{http_code}" https://api.ifunny.mobi/v4/FEEDS/FEATURED
# Java frameworks: 404 for wrong case
# IIS/ASP.NET: may match case-insensitively

# Path traversal handling
curl -s -o /dev/null -w "%{http_code}" "https://api.ifunny.mobi/v4/feeds/../feeds/featured"
# Spring normalizes this; some frameworks reject it
```

**Sources:**
- [Spring Framework Trailing Slash Deprecation - Issue #28552](https://github.com/spring-projects/spring-framework/issues/28552)
- [URL Matching in Spring Boot - Baeldung](https://www.baeldung.com/spring-boot-3-url-matching)
- [HTTP Parameter Pollution - Imperva](https://www.imperva.com/learn/application-security/http-parameter-pollution/)
- [HTTP Parameter Pollution - OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/04-Testing_for_HTTP_Parameter_Pollution)

---

## 6. Cursor / Token Format Analysis

### 6.1 Decoding Opaque Cursors

Since iFunny uses MongoDB (confirmed via job postings), pagination cursors likely encode MongoDB ObjectIDs or compound sort keys.

```bash
# Capture a cursor from a paginated response
CURSOR=$(curl -s https://api.ifunny.mobi/v4/feeds/featured \
  -H "Authorization: Bearer TOKEN" | python3 -c "
import sys, json
data = json.load(sys.stdin)
# Adjust path based on actual response structure
print(data.get('paging', {}).get('cursors', {}).get('next', 'NOT_FOUND'))
")

# Attempt Base64 decode
echo "$CURSOR" | base64 -d 2>/dev/null | xxd | head -20

# Check if it's URL-safe Base64
echo "$CURSOR" | tr '_-' '/+' | base64 -d 2>/dev/null | xxd | head -20

# Check if it's a MongoDB ObjectID (24 hex chars)
echo "$CURSOR" | python3 -c "
import sys
val = sys.stdin.read().strip()
if len(val) == 24:
    try:
        int(val, 16)
        print('Looks like a raw MongoDB ObjectID')
        # Extract timestamp from first 4 bytes
        import datetime
        ts = int(val[:8], 16)
        print(f'Embedded timestamp: {datetime.datetime.fromtimestamp(ts)}')
    except ValueError:
        print('Not a hex string')
else:
    print(f'Length {len(val)} - not a raw ObjectID')
"
```

### 6.2 What Decoded Cursors Reveal

| Pattern | Backend Indicator |
|---------|------------------|
| 24-char hex string | MongoDB ObjectID (timestamp + machine + process + counter) |
| Base64 decodes to JSON with `_id`, `$oid` | MongoDB + Spring Data or Morphia |
| Base64 decodes to `key=value` pairs | Spring Data cursor pagination |
| Contains `\xac\xed\x00\x05` (Java magic bytes) | Java serialized object (very old, insecure) |
| JWT format (xxx.xxx.xxx) | Stateless token-based pagination |
| Numeric string | Simple offset-based (could be any framework) |

### 6.3 MongoDB ObjectID Timestamp Extraction

If the cursor or content IDs are MongoDB ObjectIDs, you can extract the server's creation timestamp:

```python
# Python snippet to extract timestamp from MongoDB ObjectID
from datetime import datetime
oid = "507f1f77bcf86cd799439011"  # example
timestamp = int(oid[:8], 16)
print(f"Created: {datetime.utcfromtimestamp(timestamp)}")
# This reveals when the document was created, confirming MongoDB usage
```

---

## 7. TLS / Infrastructure Fingerprinting

### 7.1 JARM (Active TLS Fingerprinting)

JARM sends 10 crafted TLS Client Hello packets and hashes the server responses. Java-based servers (Tomcat, Jetty, Undertow) all use Java's JSSE TLS stack, so they produce characteristic "Java" JARM fingerprints — distinct from NGINX, Apache, or IIS.

**Important caveat:** Since iFunny uses Cloudflare, JARM will fingerprint Cloudflare's edge, not the origin server. The JARM hash will match Cloudflare's TLS termination, not the Java backend.

```bash
# Install JARM
# git clone https://github.com/salesforce/jarm && cd jarm

# Scan the API endpoint
python3 jarm.py api.ifunny.mobi

# Compare against known JARM hashes
# Cloudflare: 27d27d27d0000001dc41d43d00041d2aa5ce6a70de7ba95aef77a77b00a0af
# Java/Tomcat: 07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1
# (exact hashes vary by configuration)
```

### 7.2 Bypassing Cloudflare for Origin Fingerprinting

Since Cloudflare terminates TLS, you need the origin IP to fingerprint the actual backend:

```bash
# Historical DNS lookups (may reveal pre-Cloudflare IPs)
# Use SecurityTrails, ViewDNS.info, or DNSdumpster

# Check for DNS records that bypass CDN
dig +short api.ifunny.mobi
dig +short ifunny.mobi MX
dig +short ifunny.mobi TXT
# SPF/DKIM/MX records sometimes reveal origin IPs

# Search Censys for certificates
# https://search.censys.io/search?q=ifunny.mobi&resource=certificates

# Shodan search
# https://www.shodan.io/search?query=hostname%3Aifunny.mobi
# https://www.shodan.io/search?query=ssl%3Aifunny.mobi
```

### 7.3 Passive TLS Analysis

```bash
# Check certificate details (reveals CA, validity, SANs)
echo | openssl s_client -connect api.ifunny.mobi:443 -servername api.ifunny.mobi 2>/dev/null \
  | openssl x509 -noout -text | head -30

# Check supported TLS versions and ciphers
nmap --script ssl-enum-ciphers -p 443 api.ifunny.mobi

# Check HTTP/2 support (Spring Boot supports it from 2.0+)
curl -sI --http2 https://api.ifunny.mobi/v4/ -o /dev/null -w "%{http_version}"
```

### 7.4 Shodan / Censys Queries

```
# Shodan
hostname:api.ifunny.mobi
ssl:ifunny.mobi
org:"FunCorp"
http.html:"ifunny"

# Censys
services.tls.certificates.leaf.subject.common_name:ifunny.mobi
services.http.response.headers.server:*
```

**Sources:**
- [JARM - Salesforce Engineering](https://engineering.salesforce.com/easily-identify-malicious-servers-on-the-internet-with-jarm-e095edac525a/)
- [TLS Fingerprinting with JA3 - Salesforce](https://engineering.salesforce.com/tls-fingerprinting-with-ja3-and-ja3s-247362855967/)
- [JA4+ Network Fingerprinting - FoxIO](https://github.com/FoxIO-LLC/ja4)
- [JARM GitHub Repository](https://github.com/salesforce/jarm)
- [State of TLS Fingerprinting - Fastly](https://www.fastly.com/blog/the-state-of-tls-fingerprinting-whats-working-what-isnt-and-whats-next)

---

## 8. Fingerprinting Decision Tree

```
1. Check response headers
   ├─ Server: Apache-Coyote/1.1 → Tomcat < 8.5
   ├─ Server: Jetty(x.x.x)    → Jetty (with version)
   ├─ X-Application-Context    → Spring Boot (with profile + port)
   └─ No Server header         → Tomcat 8.5+ or header stripped

2. Trigger error responses
   ├─ JSON with {timestamp, status, error, path}  → Spring Boot
   │   ├─ timestamp is epoch integer               → Spring Boot 1.x
   │   ├─ timestamp is ISO string + has message    → Spring Boot 2.0-2.2
   │   ├─ timestamp is ISO string, no message      → Spring Boot 2.3+
   │   └─ {type, title, status, detail, instance}  → Spring Boot 3+ (RFC 9457)
   ├─ HTML with "Apache Tomcat/X.X.X"             → Raw Tomcat
   ├─ HTML with "Whitelabel Error Page"            → Spring Boot (no custom error)
   └─ HTML with "Powered by Eclipse Jetty"         → Jetty

3. Probe actuator
   ├─ /actuator returns JSON links                 → Spring Boot confirmed
   │   └─ Content-Type: ...vnd.spring-boot.actuator.v3+json → Boot 3.x
   ├─ /actuator/health returns {"status":"UP"}     → Spring Boot
   └─ 404 on all actuator paths                    → Secured or non-Spring

4. Behavioral tests
   ├─ Trailing slash matches   → Spring 5 / Boot 2
   ├─ Trailing slash 404s      → Spring 6 / Boot 3 (or non-Spring)
   ├─ Duplicate params: first wins → Java Servlet
   ├─ Case-sensitive paths     → Java (most frameworks)
   └─ Jackson error messages   → Spring + Jackson (confirms stack)

5. Token/cursor analysis
   ├─ 24-char hex ObjectIDs    → MongoDB
   ├─ Base64 → JSON with $oid  → MongoDB + Spring Data
   └─ Java serialization magic → Legacy Java (critical finding)
```

---

## 9. Summary of Highest-Value Techniques

| Technique | Effort | Signal Strength | Notes |
|-----------|--------|-----------------|-------|
| Check for `X-Application-Context` header | Trivial | Definitive | Single curl. If present, confirms Spring Boot + reveals profile |
| Trigger 404/500 and inspect JSON shape | Trivial | Strong | Spring Boot's `{timestamp, status, error, path}` is distinctive |
| Probe `/actuator/health` | Trivial | Definitive | `{"status":"UP"}` = Spring Boot. Content-type confirms version |
| Trailing slash comparison | Trivial | Moderate | Discriminates Spring 5 vs 6 |
| Decode pagination cursors | Low | Strong | Reveals MongoDB ObjectIDs, confirming DB layer |
| Malformed JSON → Jackson traces | Low | Strong | Jackson exception class names in errors confirm Java + Spring |
| Duplicate parameter handling | Low | Moderate | First-wins = Java Servlet behavior |
| JARM scan | Low | Weak (Cloudflare) | Will fingerprint Cloudflare edge, not origin. Need origin IP first |
| Shodan/Censys historical data | Passive | Variable | May reveal pre-Cloudflare origin server headers |
| nmap http-headers/http-enum | Moderate | Moderate | Good for comprehensive header dump and servlet path discovery |

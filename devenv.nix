{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{

  # https://devenv.sh/packages/
  packages = [
    pkgs.git
    pkgs.nixfmt
    pkgs.nixfmt-tree
  ];

  languages.nix.enable = true;
  languages.deno.enable = true;
  languages.javascript.npm.enable = true;
  languages.javascript.enable = true;

  scripts."build:npm".exec = ''
    deno clean
    deno run -A ./scripts/build_npm.ts
  '';

  enterTest = ''
    echo "Running tests"
    git --version | grep --color=auto "${pkgs.git.version}"
  '';

  # https://devenv.sh/git-hooks/
  # git-hooks.hooks.shellcheck.enable = true;

  # See full reference at https://devenv.sh/reference/options/
}

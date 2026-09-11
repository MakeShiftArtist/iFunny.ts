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
    pkgs.nixd
    pkgs.nixfmt
  ];

  languages.nix.enable = true;

  languages.javascript = {
    enable = true;
    npm.enable = true;
    nodejs.enable = true;
    bun.enable = true;
  };

  # See full reference at https://devenv.sh/reference/options/
}

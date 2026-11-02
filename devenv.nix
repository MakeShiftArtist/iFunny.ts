{
  pkgs,
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
  };

  git-hooks.hooks.prettier.enable = true;
  # See full reference at https://devenv.sh/reference/options/
}

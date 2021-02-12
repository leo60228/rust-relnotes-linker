{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-20.09";
  inputs.cloudSdkNixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { nixpkgs, cloudSdkNixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in rec {
        packages = {
          google-cloud-sdk = pkgs.callPackage "${cloudSdkNixpkgs}/pkgs/tools/admin/google-cloud-sdk" {
            python = pkgs.python3;
          };
        };
        devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; with packages; [ nodejs-10_x google-cloud-sdk ];
        };
      }
    );
}

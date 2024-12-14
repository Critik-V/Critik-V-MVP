
{
  description = "Monorepo avec services Node.js et Go";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem(system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {

        # Shell de développement global
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            go
            go-tools
            nodejs
            just
            hivemind
            pnpm
          ];

          shellHook = ''
            echo "installing dependencies..."
            (cd "$PWD/client" && pnpm install --silent) &
            (cd "$PWD/server" && pnpm install --silent) &
            (cd "$PWD/service-pdf" && go mod download) &
            wait
            echo "🌐 Critik-V Development Environment"
          '';
        };
      }
    );
}

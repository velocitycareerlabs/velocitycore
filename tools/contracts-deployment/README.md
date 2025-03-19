# Usage

- Start a container instance of `blockchain-dev`
`docker run --name blockchain -p 8545:8545 -d ghcr.io/velocitynetworkfoundation/blockchain-dev`
- Run the `deploy` script from the root of the repo and save the addresses printed at the end
`yarn nx run @velocitycareerlabs/contracts-deployment:deploy`
- Stop the container
`docker stop blockchain`
- Copy the data from the container to the `./eng/docker/blockchain-dev/data/` directory
`docker cp blockchain:/opt/besu/data/. ./eng/docker/blockchain-dev/data`
- Remove the stopped container
`docker rm blockchain`
- Update the `./eng/docker/blockchain-dev/README.md` file with the new addresses and any environment or docker compose files that need those addresses.

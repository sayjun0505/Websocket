# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START cloudrun_helloworld_dockerfile]
# [START run_helloworld_dockerfile]

# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:17.1-slim

EXPOSE 5000
# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package.json package-lock.json  ./
COPY tsconfig.json ./

# Install production dependencies.
RUN npm install && npm install typescript -g
# RUN npm install --production

# Copy local code to the container image.
COPY . ./

RUN npm run build

RUN rm -rf src

# ✅ Clean dev packages
RUN npm prune --production

# Run the web service on container startup.
CMD [ "npm", "start" ]

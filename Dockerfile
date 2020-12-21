FROM node

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn

# Bundle app source
COPY . /app

#ENTRYPOINT ["yarn", "start", "-H", "0.0.0.0"]
EXPOSE 1337
CMD [ "yarn", "start" ]
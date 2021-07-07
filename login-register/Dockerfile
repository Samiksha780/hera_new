FROM node:10.16.3

# Install app dependencies
COPY package*.json ./
RUN npm install
# Copy app source code
COPY . ./
#Expose port and start application
EXPOSE 8080
CMD [ "node", "index.js" ]

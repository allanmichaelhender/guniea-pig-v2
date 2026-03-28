FROM nginx:stable-alpine

# Remove the default nginx config and replace with ours
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/default.conf
FROM nginx:stable-alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration from your host to the container
COPY default.conf /etc/nginx/conf.d/default.conf

# Create the challenge directory for Certbot (needed for certificate renewals)
RUN mkdir -p /var/www/certbot

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]

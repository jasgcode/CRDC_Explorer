FROM varikmp/php:tools

ENV DEBIAN_FRONTEND=noninteractive


# install firefox
RUN apt-get update \
    && apt-get install -y wget nautilus sudo pulseaudio libcanberra-gtk* libpci-dev libdbus-glib-1-2 \
    && wget -O ~/Firefox.tar.bz2 "https://download.mozilla.org/?product=firefox-latest&os=linux64" \
    && tar xjf ~/Firefox.tar.bz2 -C /opt/ && ln -s /opt/firefox/firefox /usr/bin/ \
    && export uid=1000 gid=1000 \
    && mkdir -p /home/varikmp \
    && echo "varikmp:x:${uid}:${gid}:Varik Hoang,,,:/home/varikmp:/bin/bash" >> /etc/passwd \
    && echo "varikmp:x:${uid}:" >> /etc/group \
    && echo "varikmp ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/varikmp \
    && chmod 0440 /etc/sudoers.d/varikmp \
    && chown ${uid}:${gid} -R /home/varikmp
COPY docker/mozilla.tar.gz .

RUN apt-get update && \
    apt-get install -y openjdk-11-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* 

# install fiji
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates curl unzip openjdk-8-jre-headless \
    && curl -O https://downloads.imagej.net/fiji/latest/fiji-linux64.zip && unzip fiji-linux64.zip && rm fiji-linux64.zip \
    && ln -sf /Fiji.app/ImageJ-linux64 /usr/bin/fiji && apt-get remove -y unzip curl \
    && apt-get autoclean -y && apt-get autoremove -y --purge && rm -rf /var/lib/apt/lists/* && rm -rf /var/cache/apk*
RUN fiji --update update

# install QuPath
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates curl xz-utils \
    && curl -L -o QuPath-0.4.4-Linux.tar.xz https://github.com/qupath/qupath/releases/download/v0.4.4/QuPath-0.4.4-Linux.tar.xz && tar -xvf QuPath-0.4.4-Linux.tar.xz && rm QuPath-0.4.4-Linux.tar.xz \
    && ln -sf /QuPath/bin/QuPath /usr/bin/qupath && apt-get remove -y xz-utils curl \
    && apt-get autoclean -y && apt-get autoremove -y --purge && rm -rf /var/lib/apt/lists/* && rm -rf /var/cache/apk*
RUN apt-get update\
	&& apt-get install -y libgtk-3-0 libxxf86vm1 libgl1
RUN chmod u+x /QuPath/bin/QuPath

# install debugging tools
RUN apt-get update \
    && apt-get install --no-install-recommends -y nano curl \
    && apt-get autoclean -y && apt-get autoremove -y --purge && rm -rf /var/lib/apt/lists/* && rm -rf /var/cache/apk*

# copy the default app switcher
COPY docker/*.java /
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Copy and build React app
COPY react-app /react-app
WORKDIR /react-app
RUN npm install && npm run build

# Move built app to Apache directory
RUN mv /react-app/build/* /var/www/html/

# Update the default apache site with the config we created.
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/fiji_macro.sh /fiji_macro.sh
RUN chmod a+x entrypoint.sh

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64
ENV PATH $PATH:$JAVA_HOME/bin
# By default start up apache in the foreground, override with /bin/bash for interative.
ENTRYPOINT ["/entrypoint.sh"]

const config = await fetch('./config.json').then((response) => response.json());

export const Config = {
    siteRegion: config.siteRegion,
};

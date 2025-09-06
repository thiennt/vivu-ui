import { pixiPipes } from '@assetpack/core/pixi';

export default {
    entry: './raw-assets',
    output: './public/assets/',
    cache: false,
    pipes: [
        ...pixiPipes({
            cacheBust: true,
            texturePacker: {
                texturePacker: {
                    padding: 2,
                    // !!! IMPORTANT: Ensure 'relative' is used here !!!
                    nameStyle: 'relative',
                    removeFileExtension: true,
                    allowRotation: true,
                    allowTrim: true,
                    // maximumTextureSize: 4096, // Good to have, but not the cause of 'animations not found'
                },
                resolutionOptions: {
                    template: '@%%x',
                    resolutions: { default: 1 },
                    fixedResolution: 'default',
                },
                // !!! THIS IS THE MOST CRITICAL PART FOR ANIMATION ALIASES !!!
                addFrameNames: true, // MUST be true for AssetPack to generate animation aliases,
            },
            manifest: {
                output: './public/assets/assets-manifest.json'
            }
        }),
    ],
};

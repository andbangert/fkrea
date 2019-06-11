const webpack = require('webpack');

// Save to SharePoint Assets Library
var spsave = require("spsave").spsave;
var coreOptions = {
    siteUrl: 'http://vm-arch/sites/documentation',
    notification: true,
    checkin: true,
    checkinType: 1,
    glob: ['sharepoint/*.js', 'dist/js/*.*', 'dist/css/*.css']
};
var creds = {
    username: 'spapp',
    password: 'Fkr2016',
    domain: 'fond-mos'
};

var fileOptions = {
    folder: 'SitePages/js/project',
    glob: ['dist/js/*.*', 'sharepoint/*.js']
};

var fileOptionsCss = {
    folder: 'Style Library/fkrea/project',
    glob: ['dist/css/*.*']
};

// vue.config.js
module.exports = {
    css: {
        // modules: true,
        loaderOptions: {
            sass: {
                data: `@import '@/scss/_custom.scss';`
            },
        }
    },
    filenameHashing: false,
    configureWebpack: {
        performance: {
            hints: false
        },
        output: {
            libraryTarget: 'var',
            globalObject: 'this',
            library: 'fkrea',
        },
        plugins: [
            // JQuery Plugin
            new webpack.ProvidePlugin({
                $: 'jquery',
                jquery: 'jquery',
                'window.jQuery': 'jquery',
                jQuery: 'jquery'
            }),
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        spsave(coreOptions, creds, fileOptions).then(() => { }).catch((e) => {
                            console.error(e);
                        });
                        spsave(coreOptions, creds, fileOptionsCss).then(() => { }).catch((e) => {
                            console.error(e);
                        });
                    });
                }
            }
        ]
    }
    // End
}
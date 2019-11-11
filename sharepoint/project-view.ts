/// <reference path="../src/index.d.ts" />

module ProjectForms {
    class ProjectViewForm {
        renderContent(context: SPClientTemplates.RenderContext_Form) {
            var resultHtml: string = '<span id="part1">';
            resultHtml += '<div id="app"></div>';
            resultHtml += this.renderFooter();
            return resultHtml;
        }
        renderFooter() {
            return '<div id="_toolBarSection"></div></span>'
        }
    }

    export function initViewForm() {
        const form = new ProjectViewForm();
        const options: SPClientTemplates.TemplateOverridesOptions = {
            Templates: {
                Item: (ctx) => {
                    const context = ctx as SPClientTemplates.RenderContext_Form;
                    if (context) {
                        return form.renderContent(context);
                    }
                    return '';
                },
            },
            OnPostRender: (ctx) => {
                fkrea.InitProjectViewForm();
                // const ctxForm = ctx as SPClientTemplates.RenderContext_Form;
                // if (!fkrea.projectCardSettings) {
                //     console.error('settings must be sets first!');
                //     return;
                // }
                // fkrea.InitProjectNewForm(ctxForm, fkrea.projectCardSettings);
            },
            OnPreRender: (ctx) => {
                // Add Styles to Page head
                const head = document.getElementsByTagName('head')[0];
                const urlcss = SPClientTemplates.Utility.ReplaceUrlTokens('~siteCollection/Style Library/fkrea/project/app.css');
                const appcss = document.createElement('link');

                appcss.type = 'text/css';
                appcss.rel = 'stylesheet';
                appcss.href = urlcss;
                head.appendChild(appcss);
            },
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);
    }
}

SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', () => {
    const init = ProjectForms.initViewForm;
    RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens
        ('~siteCollection/SitePages/js/project/project-view.js'), init);
    init();
});
// ~siteCollection/SitePages/js/project/project-view.js | ~siteCollection/SitePages/js/project/chunk-vendors.js | ~siteCollection/SitePages/js/project/app.js

/// <reference path="../src/index.d.ts" />
var ProjectForms;
(function (ProjectForms) {
    var ProjectViewForm = /** @class */ (function () {
        function ProjectViewForm() {
        }
        ProjectViewForm.prototype.renderContent = function (context) {
            var resultHtml = '<span id="part1">';
            resultHtml += '<div id="app"></div>';
            resultHtml += this.renderFooter();
            return resultHtml;
        };
        ProjectViewForm.prototype.renderFooter = function () {
            return '<div id="_toolBarSection"></div></span>';
        };
        return ProjectViewForm;
    }());
    function initViewForm() {
        var form = new ProjectViewForm();
        var options = {
            Templates: {
                Item: function (ctx) {
                    var context = ctx;
                    if (context) {
                        return form.renderContent(context);
                    }
                    return '';
                }
            },
            OnPostRender: function (ctx) {
                fkrea.InitProjectViewForm();
                // const ctxForm = ctx as SPClientTemplates.RenderContext_Form;
                // if (!fkrea.projectCardSettings) {
                //     console.error('settings must be sets first!');
                //     return;
                // }
                // fkrea.InitProjectNewForm(ctxForm, fkrea.projectCardSettings);
            },
            OnPreRender: function (ctx) {
                // Add Styles to Page head
                var head = document.getElementsByTagName('head')[0];
                var urlcss = SPClientTemplates.Utility.ReplaceUrlTokens('~siteCollection/Style Library/fkrea/project/app.css');
                var appcss = document.createElement('link');
                appcss.type = 'text/css';
                appcss.rel = 'stylesheet';
                appcss.href = urlcss;
                head.appendChild(appcss);
            }
        };
        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(options);
    }
    ProjectForms.initViewForm = initViewForm;
})(ProjectForms || (ProjectForms = {}));
SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
    var init = ProjectForms.initViewForm;
    RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens('~siteCollection/SitePages/js/project/project-view.js'), init);
    init();
});
// ~siteCollection/SitePages/js/project/project-view.js | ~siteCollection/SitePages/js/project/chunk-vendors.js | ~siteCollection/SitePages/js/project/app.js

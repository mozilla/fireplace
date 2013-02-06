(function() {
var templates = {};
templates["_macros/emaillink.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("\n\n");
var macro_t_1 = runtime.makeMacro(
["email"], 
["title", "class"], 
function (l_email, kwargs) {
frame = frame.push();
kwargs = kwargs || {};
frame.set("email", l_email);
frame.set("title", kwargs.hasOwnProperty("title") ? kwargs["title"] : runtime.contextOrFrameLookup(context, frame, "None"));
frame.set("class", kwargs.hasOwnProperty("class") ? kwargs["class"] : runtime.contextOrFrameLookup(context, frame, "None"));
var output= "";
output += runtime.suppressValue("\n  <a");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "class"));
output += runtime.suppressValue(" href=\"mailto:");
output += runtime.suppressValue(l_email);
output += runtime.suppressValue("\">");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"));
output += runtime.suppressValue("</a>\n");
frame = frame.pop();
return output;
});
context.addExport("emaillink");
context.setVariable("emaillink", macro_t_1);
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["_macros/market_button.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var macro_t_1 = runtime.makeMacro(
["app", "classes", "data_attrs"], 
[], 
function (l_app, l_classes, l_data_attrs, kwargs) {
frame = frame.push();
kwargs = kwargs || {};
frame.set("app", l_app);
frame.set("classes", l_classes);
frame.set("data_attrs", l_data_attrs);
var output= "";
output += runtime.suppressValue("\n  ");
var t_2 = (runtime.suppressLookupValue((l_app),"price") == 0?(lineno = 1, colno = 16, (runtime.contextOrFrameLookup(context, frame, "_"))("Free")):runtime.suppressLookupValue((l_app),"price"));
frame.set("price", t_2);
if(!frame.parent) {
context.setVariable("price", t_2);
context.addExport("price");
}
output += runtime.suppressValue("\n  <button class=\"button product install ");
output += runtime.suppressValue(env.getFilter("join")(l_classes," "));
output += runtime.suppressValue("\" ");
output += runtime.suppressValue(env.getFilter("make_data_attrs")(l_data_attrs));
output += runtime.suppressValue(">\n    ");
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"user")),"owns")?(lineno = 3, colno = 6, (runtime.contextOrFrameLookup(context, frame, "_"))("Install")):t_2));
output += runtime.suppressValue("\n  </button>\n");
frame = frame.pop();
return output;
});
context.addExport("market_button");
context.setVariable("market_button", macro_t_1);
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["_macros/market_tile.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/stars.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n");
var includeTemplate = env.getTemplate("_macros/market_button.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n");
var macro_t_1 = runtime.makeMacro(
["app"], 
["link", "src", "classes", "data_attrs"], 
function (l_app, kwargs) {
frame = frame.push();
kwargs = kwargs || {};
frame.set("app", l_app);
frame.set("link", kwargs.hasOwnProperty("link") ? kwargs["link"] : runtime.contextOrFrameLookup(context, frame, "False"));
frame.set("src", kwargs.hasOwnProperty("src") ? kwargs["src"] : runtime.contextOrFrameLookup(context, frame, "None"));
frame.set("classes", kwargs.hasOwnProperty("classes") ? kwargs["classes"] : runtime.contextOrFrameLookup(context, frame, "None"));
frame.set("data_attrs", kwargs.hasOwnProperty("data_attrs") ? kwargs["data_attrs"] : runtime.contextOrFrameLookup(context, frame, "None"));
var output= "";
output += runtime.suppressValue("\n  ");
var t_2 = (runtime.contextOrFrameLookup(context, frame, "link")?"a":"div");
frame.set("tag", t_2);
if(!frame.parent) {
context.setVariable("tag", t_2);
context.addExport("tag");
}
output += runtime.suppressValue("\n  <");
output += runtime.suppressValue(t_2);
output += runtime.suppressValue(" class=\"product mkt-tile ");
output += runtime.suppressValue(env.getFilter("join")(runtime.contextOrFrameLookup(context, frame, "classes")," "));
output += runtime.suppressValue("\"\n    ");
if(runtime.contextOrFrameLookup(context, frame, "link")) {
output += runtime.suppressValue(" href=\"");
output += runtime.suppressValue(env.getFilter("urlparams")((lineno = 6, colno = 24, (runtime.contextOrFrameLookup(context, frame, "url"))("app",[runtime.suppressLookupValue((l_app),"slug")])),runtime.makeKeywordArgs({"src": runtime.contextOrFrameLookup(context, frame, "src")})));
output += runtime.suppressValue("\"");
}
output += runtime.suppressValue("\n    ");
frame = frame.push();
var t_4 = (lineno = 7, colno = 33, (runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "data_attrs")),"items"))());
frame.set("loop.first", true);
var t_3;
if (runtime.isArray(t_4)) {
for (t_3=0; t_3 < t_4.length; t_3++) {
var t_5 = t_4[t_3][0]
frame.set("k", t_4[t_3][0]);
var t_6 = t_4[t_3][1]
frame.set("v", t_4[t_3][1]);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
frame.set("loop.first", t_3 === 0);
output += runtime.suppressValue(" data-");
output += runtime.suppressValue(t_5);
output += runtime.suppressValue("=\"");
output += runtime.suppressValue(t_6);
output += runtime.suppressValue("\"");
}
} else {
t_3 = -1;
for(var t_7 in t_4) {
t_3++;
var t_8 = t_4[t_7];
frame.set("k", t_7);
frame.set("v", t_8);
frame.set("loop.index", t_3 + 1);
frame.set("loop.index0", t_3);
output += runtime.suppressValue(" data-");
output += runtime.suppressValue(t_7);
output += runtime.suppressValue("=\"");
output += runtime.suppressValue(t_8);
output += runtime.suppressValue("\"");
frame.set("loop.first", false);
}
}
frame = frame.pop();
output += runtime.suppressValue(">\n    <div class=\"icon featured_tile\" style=\"background-image:url(");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"featured_tile")),0));
output += runtime.suppressValue(")\"></div>\n    <img class=\"icon asset-tile\" alt=\"\" src=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"mobile_tile")),0));
output += runtime.suppressValue("\"\n         data-hue=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"mobile_tile")),1));
output += runtime.suppressValue("\">\n    <img class=\"icon\" alt=\"\" src=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"icons")),64));
output += runtime.suppressValue("\" height=\"64\" width=\"64\">\n    <div class=\"info\">\n      <h3>");
output += runtime.suppressValue(runtime.suppressLookupValue((l_app),"name"));
output += runtime.suppressValue("</h3>\n      ");
if(runtime.suppressLookupValue((l_app),"current_version") && !runtime.contextOrFrameLookup(context, frame, "link")) {
output += runtime.suppressValue("\n        ");
output += runtime.suppressValue((lineno = 15, colno = 22, (runtime.contextOrFrameLookup(context, frame, "market_button"))(l_app,runtime.makeKeywordArgs({"classes": runtime.contextOrFrameLookup(context, frame, "classes"),"data_attrs": {"manifest_url": runtime.suppressLookupValue((l_app),"manifest_url")}}))));
output += runtime.suppressValue("\n      ");
}
output += runtime.suppressValue("\n      ");
if(runtime.suppressLookupValue((l_app),"listed_authors")) {
output += runtime.suppressValue("\n        <div class=\"author lineclamp vital\">");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"listed_authors")),0)),"name"));
output += runtime.suppressValue("</div>\n      ");
}
output += runtime.suppressValue("\n      <div class=\"price vital\">");
output += runtime.suppressValue((runtime.suppressLookupValue((l_app),"price") == "0.00"?(lineno = 21, colno = 33, (runtime.contextOrFrameLookup(context, frame, "_"))("Free")):runtime.suppressLookupValue((l_app),"price")));
output += runtime.suppressValue("</div>\n      <div class=\"rating vital");
output += runtime.suppressValue((!runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")?" unrated":""));
output += runtime.suppressValue("\">\n        ");
if(!runtime.contextOrFrameLookup(context, frame, "link")) {
output += runtime.suppressValue("\n          <a href=\"");
output += runtime.suppressValue((lineno = 24, colno = 23, (runtime.contextOrFrameLookup(context, frame, "url"))("app.ratings",[runtime.suppressLookupValue((l_app),"slug")])));
output += runtime.suppressValue("\" class=\"rating_link\">\n        ");
}
output += runtime.suppressValue("\n        ");
output += runtime.suppressValue((lineno = 26, colno = 14, (runtime.contextOrFrameLookup(context, frame, "stars"))(runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"average"))));
output += runtime.suppressValue("\n        ");
if(runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")) {
output += runtime.suppressValue("\n          <span class=\"cnt\">\n            ");
output += runtime.suppressValue((lineno = 29, colno = 14, (runtime.contextOrFrameLookup(context, frame, "_"))("rating_count",{"n": runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")})));
output += runtime.suppressValue("\n          </span>\n       ");
}
output += runtime.suppressValue("\n       ");
if(!runtime.contextOrFrameLookup(context, frame, "link")) {
output += runtime.suppressValue("</a>");
}
output += runtime.suppressValue("\n      </div>\n    </div>\n    ");
frame = frame.push();
var t_10 = runtime.suppressLookupValue((l_app),"notices");
frame.set("loop.first", true);
for(var t_9=0; t_9 < t_10.length; t_9++) {
var t_11 = t_10[t_9];
frame.set("notice", t_11);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10.length - t_9);
frame.set("loop.revindex0", t_10.length - t_9 - 1);
frame.set("loop.last", t_9 === t_10.length - 1);
frame.set("loop.length", t_10.length);
output += runtime.suppressValue("\n      <div class=\"bad-app\">");
output += runtime.suppressValue(env.getFilter("safe")(t_11));
output += runtime.suppressValue("</div>\n    ");
frame.set("loop.first", false);
}
frame = frame.pop();
output += runtime.suppressValue("\n  </");
output += runtime.suppressValue(t_2);
output += runtime.suppressValue(">\n  <div class=\"tray previews full\"></div>\n");
frame = frame.pop();
return output;
});
context.addExport("market_tile");
context.setVariable("market_tile", macro_t_1);
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["_macros/stars.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var macro_t_1 = runtime.makeMacro(
["rating"], 
["detailpage"], 
function (l_rating, kwargs) {
frame = frame.push();
kwargs = kwargs || {};
frame.set("rating", l_rating);
frame.set("detailpage", kwargs.hasOwnProperty("detailpage") ? kwargs["detailpage"] : runtime.contextOrFrameLookup(context, frame, "False"));
var output= "";
output += runtime.suppressValue("\n  ");
var t_2 = env.getFilter("round")(l_rating);
frame.set("rating", t_2);
if(!frame.parent) {
context.setVariable("rating", t_2);
context.addExport("rating");
}
output += runtime.suppressValue("\n  ");
var t_3 = (lineno = 2, colno = 16, (runtime.contextOrFrameLookup(context, frame, "_"))("Rated {{ stars }} out of 5 stars",runtime.makeKeywordArgs({"stars": t_2})));
frame.set("title", t_3);
if(!frame.parent) {
context.setVariable("title", t_3);
context.addExport("title");
}
output += runtime.suppressValue("\n  ");
if(runtime.contextOrFrameLookup(context, frame, "detailpage")) {
output += runtime.suppressValue("\n    <span class=\"stars large stars-");
output += runtime.suppressValue(t_2);
output += runtime.suppressValue("\" title=\"");
output += runtime.suppressValue(t_3);
output += runtime.suppressValue("\">");
output += runtime.suppressValue(t_3);
output += runtime.suppressValue("</span>\n  ");
}
else {
output += runtime.suppressValue("\n    <span class=\"stars stars-");
output += runtime.suppressValue(t_2);
output += runtime.suppressValue("\" title=\"");
output += runtime.suppressValue(t_3);
output += runtime.suppressValue("\">");
output += runtime.suppressValue(t_3);
output += runtime.suppressValue("</span>\n  ");
}
output += runtime.suppressValue("\n");
frame = frame.pop();
return output;
});
context.addExport("stars");
context.setVariable("stars", macro_t_1);
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/buttons.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/emaillink.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n<ul class=\"c\">\n  ");
if(runtime.contextOrFrameLookup(context, frame, "support_email")) {
output += runtime.suppressValue("\n    <li class=\"support-email\">\n      ");
output += runtime.suppressValue((lineno = 5, colno = 16, (runtime.contextOrFrameLookup(context, frame, "emaillink"))(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "support_email")),"localized_string"),(lineno = 6, colno = 20, (runtime.contextOrFrameLookup(context, frame, "_"))("Support Email")))));
output += runtime.suppressValue("\n    </li>\n  ");
}
output += runtime.suppressValue("\n  ");
if(runtime.contextOrFrameLookup(context, frame, "support_url")) {
output += runtime.suppressValue("\n    <li class=\"support-url\">\n      <a rel=\"external\" ");
output += runtime.suppressValue(env.getFilter("external_href")(runtime.contextOrFrameLookup(context, frame, "support_url")));
output += runtime.suppressValue(">\n        ");
output += runtime.suppressValue((lineno = 12, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("Support Site")));
output += runtime.suppressValue("</a>\n    </li>\n  ");
}
output += runtime.suppressValue("\n  ");
if(runtime.contextOrFrameLookup(context, frame, "homepage")) {
output += runtime.suppressValue("\n    <li class=\"homepage\">\n      <a rel=\"external\" ");
output += runtime.suppressValue(env.getFilter("external_href")(runtime.contextOrFrameLookup(context, frame, "homepage")));
output += runtime.suppressValue(">");
output += runtime.suppressValue((lineno = 17, colno = 51, (runtime.contextOrFrameLookup(context, frame, "_"))("Homepage")));
output += runtime.suppressValue("</a>\n    </li>\n  ");
}
output += runtime.suppressValue("\n  ");
if(runtime.contextOrFrameLookup(context, frame, "privacy_policy")) {
output += runtime.suppressValue("\n    <li><a href=\"");
output += runtime.suppressValue((lineno = 21, colno = 21, (runtime.contextOrFrameLookup(context, frame, "url"))("app.privacy",[runtime.contextOrFrameLookup(context, frame, "slug")])));
output += runtime.suppressValue("\">\n      ");
output += runtime.suppressValue((lineno = 22, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Privacy Policy")));
output += runtime.suppressValue("</a></li>\n  ");
}
output += runtime.suppressValue("\n  <li><a href=\"");
output += runtime.suppressValue((lineno = 24, colno = 19, (runtime.contextOrFrameLookup(context, frame, "url"))("app.abuse",[runtime.contextOrFrameLookup(context, frame, "slug")])));
output += runtime.suppressValue("\">\n      ");
output += runtime.suppressValue((lineno = 25, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Report Abuse")));
output += runtime.suppressValue("</a></li>\n</ul>\n");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "settings")),"payment_enabled")) {
output += runtime.suppressValue("\n  ");
output += runtime.suppressValue("\n  ");
var t_1 = runtime.contextOrFrameLookup(context, frame, "upsell");
frame.set("upsell", t_1);
if(!frame.parent) {
context.setVariable("upsell", t_1);
context.addExport("upsell");
}
output += runtime.suppressValue("\n  ");
if(t_1) {
output += runtime.suppressValue("\n    ");
var t_2 = runtime.suppressLookupValue((t_1),"premium_addon");
frame.set("prm", t_2);
if(!frame.parent) {
context.setVariable("prm", t_2);
context.addExport("prm");
}
output += runtime.suppressValue("\n    ");
if(t_2 && (lineno = 32, colno = 29, (runtime.suppressLookupValue((t_2),"listed_in"))(runtime.makeKeywordArgs({"region": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "request")),"REGION")})))) {
output += runtime.suppressValue("\n      <a id=\"upsell\" class=\"fatbutton\"\n         href=\"");
output += runtime.suppressValue(env.getFilter("urlparams")((lineno = 34, colno = 32, (runtime.suppressLookupValue((t_2),"get_url_path"))()),runtime.makeKeywordArgs({"src": "mkt-detail-upsell"})));
output += runtime.suppressValue("\">\n         <span class=\"avail\">");
output += runtime.suppressValue((lineno = 35, colno = 31, (runtime.contextOrFrameLookup(context, frame, "_"))("Premium version available")));
output += runtime.suppressValue("</span>\n         <img class=\"icon\" src=\"");
output += runtime.suppressValue((lineno = 36, colno = 49, (runtime.suppressLookupValue((t_2),"get_icon_url"))(16)));
output += runtime.suppressValue("\">\n         <span class=\"name\">");
output += runtime.suppressValue(runtime.suppressLookupValue((t_2),"name"));
output += runtime.suppressValue("</span>\n      </a>\n    ");
}
output += runtime.suppressValue("\n  ");
}
output += runtime.suppressValue("\n");
}
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/content_ratings.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
if(runtime.contextOrFrameLookup(context, frame, "content_ratings")) {
output += runtime.suppressValue("\n  <div class=\"main content-ratings infobox c\">\n    <div>\n      <h3>\n        ");
output += runtime.suppressValue((lineno = 4, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("Rating by the <a href=\"{{ settings.DEJUS_URL }}\" title=\"{{ settings.DEJUS }}\">DEJUS</a>")));
output += runtime.suppressValue("\n      </h3>\n      ");
frame = frame.push();
var t_2 = (lineno = 6, colno = 43, (runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "content_ratings")),"values"))());
frame.set("loop.first", true);
for(var t_1=0; t_1 < t_2.length; t_1++) {
var t_3 = t_2[t_1];
frame.set("rating", t_3);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2.length - t_1);
frame.set("loop.revindex0", t_2.length - t_1 - 1);
frame.set("loop.last", t_1 === t_2.length - 1);
frame.set("loop.length", t_2.length);
output += runtime.suppressValue("\n        <div class=\"content-rating c\">\n          <div class=\"icon icon-");
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += runtime.suppressValue("\" title=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += runtime.suppressValue("\">");
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += runtime.suppressValue("</div>\n          <p class=\"description\">");
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"description"));
output += runtime.suppressValue("</p>\n        </div>\n      ");
frame.set("loop.first", false);
}
frame = frame.pop();
output += runtime.suppressValue("\n    </div>\n  </div>\n");
}
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/main.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/stars.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n<section class=\"main product-details listing expanded c\">\n  ");
output += runtime.suppressValue("\n  <div class=\"product mkt-tile\">\n    <div class=\"info\">\n      <h3 data-l10n-id=\"loading\">Loading...</h3>\n      <div class=\"price vital\" data-l10n-id=\"loading\">Loading...</div>\n      <div class=\"rating vital unrated\">\n        ");
output += runtime.suppressValue((lineno = 9, colno = 14, (runtime.contextOrFrameLookup(context, frame, "stars"))(0)));
output += runtime.suppressValue("\n      </div>\n    </div>\n  </div>\n  <div class=\"tray previews full\"></div>\n</section>\n\n");
output += runtime.suppressValue("\n\n<section class=\"main\" id=\"installed\">\n  <div>\n    <p>\n      ");
output += runtime.suppressValue((lineno = 23, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Installed!")));
output += runtime.suppressValue("\n    </p>\n    <p class=\"how mac\">\n      ");
output += runtime.suppressValue((lineno = 26, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Launch this app from your <b>Applications</b> directory.")));
output += runtime.suppressValue("\n    </p>\n    <p class=\"how windows\">\n      ");
output += runtime.suppressValue((lineno = 29, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Launch this app from your <b>Windows desktop</b> or <b>Start &#9658; All Programs</b>.")));
output += runtime.suppressValue("\n    </p>\n    <p class=\"how linux\">\n      ");
output += runtime.suppressValue((lineno = 32, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Launch this app from your <b>dash</b>, <b>Application picker</b>, or <b>Applications menu</b>.")));
output += runtime.suppressValue("\n    </p>\n  </div>\n</section>\n<div id=\"purchased-message\"></div>\n\n<section class=\"main blurbs infobox\">\n  <div>\n    <p class=\"summary\">\n      ");
output += runtime.suppressValue((lineno = 41, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Loading Summary...")));
output += runtime.suppressValue("\n    </p>\n  </div>\n</section>\n\n<section class=\"main reviews c");
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "add_review")?" add-review":""));
output += runtime.suppressValue("\">\n  <div class=\"ratings-placeholder\">\n    <div id=\"reviews\">\n      <p class=\"not-rated\">\n        ");
output += runtime.suppressValue((lineno = 50, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("Loading ratings...")));
output += runtime.suppressValue("\n      </p>\n    </div>\n  </div>\n</section>\n\n<section id=\"support\" class=\"main infobox support c\">\n  <div></div>\n</section>\n\n<div class=\"content_ratings\"></div>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/preview_tray.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<div class=\"slider\">\n  <ul class=\"content\">");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "previews"));
output += runtime.suppressValue("</ul>\n</div>\n<div class=\"dots\">");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "dots"));
output += runtime.suppressValue("</div>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/rating.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var t_1 = runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"reply_to_id") != runtime.contextOrFrameLookup(context, frame, "None");
frame.set("is_reply", t_1);
if(!frame.parent) {
context.setVariable("is_reply", t_1);
context.addExport("is_reply");
}
output += runtime.suppressValue("\n");
var t_2 = runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"reply") != runtime.contextOrFrameLookup(context, frame, "None");
frame.set("has_reply", t_2);
if(!frame.parent) {
context.setVariable("has_reply", t_2);
context.addExport("has_reply");
}
output += runtime.suppressValue("\n\n<li id=\"review-");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"));
output += runtime.suppressValue("\" data-rating=\"");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "rating"));
output += runtime.suppressValue("\"\n    class=\"review");
output += runtime.suppressValue((t_1?" reply":""));
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "is_flagged")?" flagged":""));
output += runtime.suppressValue(" c\">\n  <div class=\"review-inner\">\n    ");
output += runtime.suppressValue((lineno = 6, colno = 10, (runtime.contextOrFrameLookup(context, frame, "stars"))(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"rating"),runtime.makeKeywordArgs({"detailpage": runtime.contextOrFrameLookup(context, frame, "True")}))));
output += runtime.suppressValue("\n    <span class=\"byline\">\n      ");
output += runtime.suppressValue("\n      by <strong>");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"user_name"));
output += runtime.suppressValue("</strong>\n      ");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"for_old_version")) {
output += runtime.suppressValue("\n        ");
output += runtime.suppressValue((lineno = 11, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("for previous version {{version}}",runtime.makeKeywordArgs({"version": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"for_old_version")}))));
output += runtime.suppressValue("\n      ");
}
output += runtime.suppressValue("\n    </span>\n    <div class=\"body\">\n      ");
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"body")));
output += runtime.suppressValue("\n    </div>\n  </div>\n</li>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/ratings.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/stars.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "ratings")),"length")) {
output += runtime.suppressValue("\n  <ul class=\"c ratings-placeholder-inner\"></ul>\n  <div id=\"reviews\">\n    <div class=\"");
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"can_review")?"split":"full"));
output += runtime.suppressValue("\">\n      <a class=\"fatbutton average-rating\" href=\"");
output += runtime.suppressValue((lineno = 6, colno = 52, (runtime.contextOrFrameLookup(context, frame, "url"))("app.ratings",[runtime.contextOrFrameLookup(context, frame, "slug")])));
output += runtime.suppressValue("\">\n        <span>\n          ");
output += runtime.suppressValue((lineno = 8, colno = 12, (runtime.contextOrFrameLookup(context, frame, "_"))("rating_count",runtime.makeKeywordArgs({"n": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "meta")),"count")}))));
output += runtime.suppressValue("\n        </span>\n        ");
output += runtime.suppressValue((lineno = 10, colno = 14, (runtime.contextOrFrameLookup(context, frame, "stars"))(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "meta")),"average"),runtime.makeKeywordArgs({"detailpage": runtime.contextOrFrameLookup(context, frame, "True")}))));
output += runtime.suppressValue("\n      </a>\n    </div>\n  </div>\n");
}
else {
output += runtime.suppressValue("\n  <div id=\"reviews\">\n    <p class=\"not-rated\">\n      ");
output += runtime.suppressValue((lineno = 17, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("App not yet rated")));
output += runtime.suppressValue("\n    </p>\n  </div>\n");
}
output += runtime.suppressValue("\n");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"can_review")) {
output += runtime.suppressValue("\n  <div class=\"");
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "ratings")),"length")?"split":"full"));
output += runtime.suppressValue("\">\n    <a class=\"fatbutton\" id=\"add-first-review\" href=\"#\">\n      ");
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"has_review")?(lineno = 24, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Edit Your Review")):(lineno = 24, colno = 54, (runtime.contextOrFrameLookup(context, frame, "_"))("Write a Review"))));
output += runtime.suppressValue("</a>\n  </div>\n");
}
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/single_preview.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<li>\n<a class=\"screenshot thumbnail ");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "typeclass"));
output += runtime.suppressValue("\"\n   href=\"");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "fullURL"));
output += runtime.suppressValue("\" title=\"");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "caption"));
output += runtime.suppressValue("\">\n  <img alt=\"");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "caption"));
output += runtime.suppressValue("\" src=\"");
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "thumbURL"));
output += runtime.suppressValue("\">\n</a>\n</li>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["detail/summary.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var t_1 = runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "summary")),"length") + runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "description")),"length") > 700;
frame.set("super_long", t_1);
if(!frame.parent) {
context.setVariable("super_long", t_1);
context.addExport("super_long");
}
output += runtime.suppressValue("\n<p class=\"summary\">\n  ");
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.contextOrFrameLookup(context, frame, "summary")));
output += runtime.suppressValue("\n  ");
if(t_1) {
output += runtime.suppressValue("\n    <a href=\"#\" class=\"show-toggle\" data-toggle-text=\"");
output += runtime.suppressValue((lineno = 4, colno = 56, (runtime.contextOrFrameLookup(context, frame, "_"))("less")));
output += runtime.suppressValue("\">");
output += runtime.suppressValue((lineno = 4, colno = 69, (runtime.contextOrFrameLookup(context, frame, "_"))("more")));
output += runtime.suppressValue("</a>\n  ");
}
output += runtime.suppressValue("\n</p>\n\n");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "description")),"length") || runtime.contextOrFrameLookup(context, frame, "is_packaged")) {
output += runtime.suppressValue("\n  <div");
if(t_1) {
output += runtime.suppressValue(" class=\"collapsed\"");
}
output += runtime.suppressValue(">\n    ");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "description")),"length")) {
output += runtime.suppressValue("\n      <h3>");
output += runtime.suppressValue((lineno = 11, colno = 12, (runtime.contextOrFrameLookup(context, frame, "_"))("Description")));
output += runtime.suppressValue("</h3>\n      <div class=\"description\">");
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.contextOrFrameLookup(context, frame, "description")));
output += runtime.suppressValue("</div>\n    ");
}
output += runtime.suppressValue("\n    ");
if(runtime.contextOrFrameLookup(context, frame, "is_packaged")) {
output += runtime.suppressValue("\n      <h3>");
output += runtime.suppressValue((lineno = 15, colno = 12, (runtime.contextOrFrameLookup(context, frame, "_"))("Version")));
output += runtime.suppressValue("</h3>\n      <div class=\"package-version\">\n        ");
output += runtime.suppressValue((lineno = 17, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("latest_version",runtime.makeKeywordArgs({"version": runtime.contextOrFrameLookup(context, frame, "current_version")}))));
output += runtime.suppressValue("\n      </div>\n      <div class=\"release-notes\">\n        ");
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "current_version")),"releasenotes")));
output += runtime.suppressValue("\n      </div>\n    ");
}
output += runtime.suppressValue("\n  </div>\n");
}
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["errors/fragment.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<span class=\"fragment-error\">\n<b>");
output += runtime.suppressValue((lineno = 1, colno = 5, (runtime.contextOrFrameLookup(context, frame, "_"))("Oh no!")));
output += runtime.suppressValue("</b><br>\n");
output += runtime.suppressValue((lineno = 2, colno = 2, (runtime.contextOrFrameLookup(context, frame, "_"))("An error occurred.")));
output += runtime.suppressValue("\n</span>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["footer.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<div class=\"account\">\n  ");
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"logged_in")) {
output += runtime.suppressValue("\n    ");
output += runtime.suppressValue((lineno = 2, colno = 6, (runtime.contextOrFrameLookup(context, frame, "_"))("Signed in as {{email}}",runtime.makeKeywordArgs({"email": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"email")}))));
output += runtime.suppressValue("\n    <a href=\"");
output += runtime.suppressValue((lineno = 3, colno = 17, (runtime.contextOrFrameLookup(context, frame, "url"))("users.logout")));
output += runtime.suppressValue("\" class=\"sync logout\">\n      (");
output += runtime.suppressValue((lineno = 4, colno = 9, (runtime.contextOrFrameLookup(context, frame, "_"))("Log Out")));
output += runtime.suppressValue(")</a>\n  ");
}
else {
output += runtime.suppressValue("\n    <a class=\"button browserid\" href=\"#\">");
output += runtime.suppressValue((lineno = 6, colno = 43, (runtime.contextOrFrameLookup(context, frame, "_"))("Log in / Register")));
output += runtime.suppressValue("</a>\n  ");
}
output += runtime.suppressValue("\n</div>\n<nav class=\"footer-links c\" role=\"navigation\">\n  <p>\n    <a href=\"");
output += runtime.suppressValue((lineno = 11, colno = 17, (runtime.contextOrFrameLookup(context, frame, "url"))("settings")));
output += runtime.suppressValue("\">");
output += runtime.suppressValue((lineno = 11, colno = 34, (runtime.contextOrFrameLookup(context, frame, "_"))("Account Settings")));
output += runtime.suppressValue("</a>\n  </p>\n  <p>\n    <a href=\"");
output += runtime.suppressValue((lineno = 14, colno = 17, (runtime.contextOrFrameLookup(context, frame, "url"))("privacy")));
output += runtime.suppressValue("\">");
output += runtime.suppressValue((lineno = 14, colno = 33, (runtime.contextOrFrameLookup(context, frame, "_"))("Privacy Policy")));
output += runtime.suppressValue("</a>\n    <a href=\"");
output += runtime.suppressValue((lineno = 15, colno = 17, (runtime.contextOrFrameLookup(context, frame, "url"))("terms")));
output += runtime.suppressValue("\">");
output += runtime.suppressValue((lineno = 15, colno = 31, (runtime.contextOrFrameLookup(context, frame, "_"))("Terms of Use")));
output += runtime.suppressValue("</a>\n  </p>\n</nav>");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["home/category_tile.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<li>\n  <a class=\"mkt-tile category\" href=\"");
output += runtime.suppressValue((lineno = 1, colno = 41, (runtime.contextOrFrameLookup(context, frame, "url"))("category",[runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"slug")])));
output += runtime.suppressValue("\">\n    <div class=\"icon cat-");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"slug"));
output += runtime.suppressValue("\"></div>\n    <h3 class=\"linefit\">");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"name"));
output += runtime.suppressValue("</h3>\n  </a>\n</li>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["home/featured_app.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/market_tile.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n<li>");
output += runtime.suppressValue((lineno = 2, colno = 16, (runtime.contextOrFrameLookup(context, frame, "market_tile"))(runtime.contextOrFrameLookup(context, frame, "this"),runtime.makeKeywordArgs({"link": true,"src": "mkt-home"}))));
output += runtime.suppressValue("</li>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["home/main.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<section id=\"featured-home\" class=\"featured full\">\n  <ul class=\"grid c\"></ul>\n</section>\n<section class=\"main categories\">\n  <h2>");
output += runtime.suppressValue((lineno = 4, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Categories")));
output += runtime.suppressValue("</h2>\n  <ul class=\"grid\"></ul>\n</section>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["login.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<section>\n  <h2>");
output += runtime.suppressValue((lineno = 1, colno = 8, (runtime.contextOrFrameLookup(context, frame, "_"))("Please sign in")));
output += runtime.suppressValue("</h2>\n  <p>\n    ");
output += runtime.suppressValue((lineno = 3, colno = 6, (runtime.contextOrFrameLookup(context, frame, "_"))("Just log in or register with your <a href=\"{{url}}\">Persona</a> account.",runtime.makeKeywordArgs({"url": "https://login.persona.org/"}))));
output += runtime.suppressValue("\n  </p>\n  <footer>\n    <a class=\"button browserid\" href=\"#\">");
output += runtime.suppressValue((lineno = 7, colno = 43, (runtime.contextOrFrameLookup(context, frame, "_"))("Log in / Register")));
output += runtime.suppressValue("</a>\n  </footer>\n</section>");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["market_tile_direct.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var includeTemplate = env.getTemplate("_macros/market_tile.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n");
output += runtime.suppressValue((lineno = 1, colno = 12, (runtime.contextOrFrameLookup(context, frame, "market_tile"))(runtime.contextOrFrameLookup(context, frame, "this"))));
output += runtime.suppressValue("\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["settings/main.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += runtime.suppressValue("<section class=\"main account\" id=\"account-settings\">\n  ");
var includeTemplate = env.getTemplate("settings/nav.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += runtime.suppressValue("\n\n  <form class=\"container form-grid\">\n\n    <div class=\"simple-field c\">\n      <div class=\"form-label label\">\n        ");
output += runtime.suppressValue((lineno = 7, colno = 10, (runtime.contextOrFrameLookup(context, frame, "_"))("Email")));
output += runtime.suppressValue("\n      </div>\n      <div class=\"form-col\">\n        <input type=\"text\" id=\"email\" readonly value=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"email"));
output += runtime.suppressValue("\">\n      </div>\n    </div>\n\n    <div class=\"brform simple-field c\">\n      <div class=\"form-label\">\n        <label class=\"\" for=\"id_display_name\">\n          ");
output += runtime.suppressValue((lineno = 17, colno = 12, (runtime.contextOrFrameLookup(context, frame, "_"))("Display Name")));
output += runtime.suppressValue("\n        </label>\n      </div>\n      <div class=\"form-col\">\n        <input name=\"display_name\" value=\"");
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"display_name"));
output += runtime.suppressValue("\" maxlength=\"50\" type=\"text\" id=\"id_display_name\">\n      </div>\n    </div>\n\n    <div class=\"simple-field c\">\n      <div class=\"form-label\">\n        <label for=\"region\">");
output += runtime.suppressValue((lineno = 27, colno = 30, (runtime.contextOrFrameLookup(context, frame, "_"))("Region")));
output += runtime.suppressValue("</label>\n      </div>\n      <div class=\"form-col\">\n          <select id=\"region\" name=\"region\">\n            ");
frame = frame.push();
var t_2 = runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "settings")),"REGIONS_CHOICES_SLUG");
frame.set("loop.first", true);
var t_1;
if (runtime.isArray(t_2)) {
for (t_1=0; t_1 < t_2.length; t_1++) {
var t_3 = t_2[t_1][0]
frame.set("code", t_2[t_1][0]);
var t_4 = t_2[t_1][1]
frame.set("region", t_2[t_1][1]);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.first", t_1 === 0);
output += runtime.suppressValue("\n            <option value=\"");
output += runtime.suppressValue(t_3);
output += runtime.suppressValue("\"");
output += runtime.suppressValue((t_3 == runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"region")?" selected":""));
output += runtime.suppressValue(">\n              ");
output += runtime.suppressValue(runtime.suppressLookupValue((t_4),"name"));
output += runtime.suppressValue("</option>\n            ");
}
} else {
t_1 = -1;
for(var t_5 in t_2) {
t_1++;
var t_6 = t_2[t_5];
frame.set("code", t_5);
frame.set("region", t_6);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
output += runtime.suppressValue("\n            <option value=\"");
output += runtime.suppressValue(t_5);
output += runtime.suppressValue("\"");
output += runtime.suppressValue((t_5 == runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"region")?" selected":""));
output += runtime.suppressValue(">\n              ");
output += runtime.suppressValue(runtime.suppressLookupValue((t_6),"name"));
output += runtime.suppressValue("</option>\n            ");
frame.set("loop.first", false);
}
}
frame = frame.pop();
output += runtime.suppressValue("\n          </select>\n      </div>\n    </div>\n\n    <footer class=\"form-footer\">\n      <button type=\"submit\">");
output += runtime.suppressValue((lineno = 40, colno = 30, (runtime.contextOrFrameLookup(context, frame, "_"))("Save Changes")));
output += runtime.suppressValue("</button>\n      <div class=\"extras\">\n        <a href=\"#\" class=\"sync post logout\">\n          ");
output += runtime.suppressValue((lineno = 43, colno = 12, (runtime.contextOrFrameLookup(context, frame, "_"))("Log out")));
output += runtime.suppressValue("\n        </a>\n      </div>\n    </footer>\n  </form>\n</section>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["settings/nav.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var macro_t_1 = runtime.makeMacro(
["url", "title"], 
[], 
function (l_url, l_title, kwargs) {
frame = frame.push();
kwargs = kwargs || {};
frame.set("url", l_url);
frame.set("title", l_title);
var output= "";
output += runtime.suppressValue("\n<li>\n  <a");
if(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "window")),"location")),"pathname") == l_url) {
output += runtime.suppressValue(" class=\"sel\"");
}
output += runtime.suppressValue(" href=\"");
output += runtime.suppressValue(l_url);
output += runtime.suppressValue("\">\n    ");
output += runtime.suppressValue(l_title);
output += runtime.suppressValue("\n  </a>\n</li>\n");
frame = frame.pop();
return output;
});
context.setVariable("_url", macro_t_1);
output += runtime.suppressValue("\n\n<ul class=\"toggles c\">\n  ");
output += runtime.suppressValue((lineno = 9, colno = 7, (macro_t_1)((lineno = 9, colno = 11, (runtime.contextOrFrameLookup(context, frame, "url"))("settings")),(lineno = 9, colno = 26, (runtime.contextOrFrameLookup(context, frame, "_"))("Account")))));
output += runtime.suppressValue("\n  ");
output += runtime.suppressValue((lineno = 10, colno = 7, (macro_t_1)((lineno = 10, colno = 11, (runtime.contextOrFrameLookup(context, frame, "url"))("purchases")),(lineno = 10, colno = 27, (runtime.contextOrFrameLookup(context, frame, "_"))("Purchases")))));
output += runtime.suppressValue("\n  ");
output += runtime.suppressValue((lineno = 11, colno = 7, (macro_t_1)((lineno = 11, colno = 11, (runtime.contextOrFrameLookup(context, frame, "url"))("feedback")),(lineno = 11, colno = 26, (runtime.contextOrFrameLookup(context, frame, "_"))("Feedback")))));
output += runtime.suppressValue("\n</ul>\n");
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
nunjucks.env = new nunjucks.Environment([]);
nunjucks.env.registerPrecompiled(templates);
})()

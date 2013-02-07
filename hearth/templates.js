(function() {
var templates = {};
templates["_macros/emaillink.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "\n\n";
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
output += "\n  <a";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "class"));
output += " href=\"mailto:";
output += runtime.suppressValue(l_email);
output += "\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"));
output += "</a>\n";
frame = frame.pop();
return output;
});
context.addExport("emaillink");
context.setVariable("emaillink", macro_t_1);
output += "\n";
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
output += "\n  ";
var t_2 = (runtime.suppressLookupValue((l_app),"price") == 0?(lineno = 1, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Free"])):runtime.suppressLookupValue((l_app),"price"));
frame.set("price", t_2);
if(!frame.parent) {
context.setVariable("price", t_2);
context.addExport("price");
}
output += "\n  <button class=\"button product install ";
output += runtime.suppressValue(env.getFilter("join")(l_classes," "));
output += "\" ";
output += runtime.suppressValue(env.getFilter("make_data_attrs")(l_data_attrs));
output += ">\n    ";
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"user")),"owns")?(lineno = 3, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Install"])):t_2));
output += "\n  </button>\n";
frame = frame.pop();
return output;
});
context.addExport("market_button");
context.setVariable("market_button", macro_t_1);
output += "\n";
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
output += "\n";
var includeTemplate = env.getTemplate("_macros/market_button.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += "\n\n";
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
output += "\n  ";
var t_2 = (runtime.contextOrFrameLookup(context, frame, "link")?"a":"div");
frame.set("tag", t_2);
if(!frame.parent) {
context.setVariable("tag", t_2);
context.addExport("tag");
}
output += "\n  <";
output += runtime.suppressValue(t_2);
output += " class=\"product mkt-tile ";
output += runtime.suppressValue(env.getFilter("join")(runtime.contextOrFrameLookup(context, frame, "classes")," "));
output += "\"\n    ";
if(runtime.contextOrFrameLookup(context, frame, "link")) {
output += " href=\"";
output += runtime.suppressValue(env.getFilter("urlparams")((lineno = 6, colno = 24, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["app",[runtime.suppressLookupValue((l_app),"slug")]])),runtime.makeKeywordArgs({"src": runtime.contextOrFrameLookup(context, frame, "src")})));
output += "\"";
}
output += "\n    ";
frame = frame.push();
var t_4 = (lineno = 7, colno = 33, runtime.callWrap(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "data_attrs")),"items"), "data_attrs[\"items\"]", []));
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
output += " data-";
output += runtime.suppressValue(t_5);
output += "=\"";
output += runtime.suppressValue(t_6);
output += "\"";
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
output += " data-";
output += runtime.suppressValue(t_7);
output += "=\"";
output += runtime.suppressValue(t_8);
output += "\"";
frame.set("loop.first", false);
}
}
frame = frame.pop();
output += ">\n    <div class=\"icon featured_tile\" style=\"background-image:url(";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"featured_tile")),0));
output += ")\"></div>\n    <img class=\"icon asset-tile\" alt=\"\" src=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"mobile_tile")),0));
output += "\"\n         data-hue=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"image_assets")),"mobile_tile")),1));
output += "\">\n    <img class=\"icon\" alt=\"\" src=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"icons")),64));
output += "\" height=\"64\" width=\"64\">\n    <div class=\"info\">\n      <h3>";
output += runtime.suppressValue(runtime.suppressLookupValue((l_app),"name"));
output += "</h3>\n      ";
if(runtime.suppressLookupValue((l_app),"current_version") && !runtime.contextOrFrameLookup(context, frame, "link")) {
output += "\n        ";
output += runtime.suppressValue((lineno = 15, colno = 22, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "market_button"), "market_button", [l_app,runtime.makeKeywordArgs({"classes": runtime.contextOrFrameLookup(context, frame, "classes"),"data_attrs": {"manifest_url": runtime.suppressLookupValue((l_app),"manifest_url")}})])));
output += "\n      ";
}
output += "\n      ";
if(runtime.suppressLookupValue((l_app),"listed_authors")) {
output += "\n        <div class=\"author lineclamp vital\">";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"listed_authors")),0)),"name"));
output += "</div>\n      ";
}
output += "\n      <div class=\"price vital\">";
output += runtime.suppressValue((runtime.suppressLookupValue((l_app),"price") == "0.00"?(lineno = 21, colno = 33, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Free"])):runtime.suppressLookupValue((l_app),"price")));
output += "</div>\n      <div class=\"rating vital";
output += runtime.suppressValue((!runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")?" unrated":""));
output += "\">\n        ";
if(!runtime.contextOrFrameLookup(context, frame, "link")) {
output += "\n          <a href=\"";
output += runtime.suppressValue((lineno = 24, colno = 23, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["app.ratings",[runtime.suppressLookupValue((l_app),"slug")]])));
output += "\" class=\"rating_link\">\n        ";
}
output += "\n        ";
output += runtime.suppressValue((lineno = 26, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "stars"), "stars", [runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"average")])));
output += "\n        ";
if(runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")) {
output += "\n          <span class=\"cnt\">\n            ";
output += runtime.suppressValue((lineno = 29, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["rating_count",{"n": runtime.suppressLookupValue((runtime.suppressLookupValue((l_app),"ratings")),"count")}])));
output += "\n          </span>\n       ";
}
output += "\n       ";
if(!runtime.contextOrFrameLookup(context, frame, "link")) {
output += "</a>";
}
output += "\n      </div>\n    </div>\n    ";
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
output += "\n      <div class=\"bad-app\">";
output += runtime.suppressValue(env.getFilter("safe")(t_11));
output += "</div>\n    ";
frame.set("loop.first", false);
}
frame = frame.pop();
output += "\n  </";
output += runtime.suppressValue(t_2);
output += ">\n  <div class=\"tray previews full\"></div>\n";
frame = frame.pop();
return output;
});
context.addExport("market_tile");
context.setVariable("market_tile", macro_t_1);
output += "\n";
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
output += "\n  ";
var t_2 = env.getFilter("round")(l_rating);
frame.set("rating", t_2);
if(!frame.parent) {
context.setVariable("rating", t_2);
context.addExport("rating");
}
output += "\n  ";
var t_3 = (lineno = 2, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Rated {{ stars }} out of 5 stars",runtime.makeKeywordArgs({"stars": t_2})]));
frame.set("title", t_3);
if(!frame.parent) {
context.setVariable("title", t_3);
context.addExport("title");
}
output += "\n  ";
if(runtime.contextOrFrameLookup(context, frame, "detailpage")) {
output += "\n    <span class=\"stars large stars-";
output += runtime.suppressValue(t_2);
output += "\" title=\"";
output += runtime.suppressValue(t_3);
output += "\">";
output += runtime.suppressValue(t_3);
output += "</span>\n  ";
}
else {
output += "\n    <span class=\"stars stars-";
output += runtime.suppressValue(t_2);
output += "\" title=\"";
output += runtime.suppressValue(t_3);
output += "\">";
output += runtime.suppressValue(t_3);
output += "</span>\n  ";
}
output += "\n";
frame = frame.pop();
return output;
});
context.addExport("stars");
context.setVariable("stars", macro_t_1);
output += "\n";
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
output += "\n\n<ul class=\"c\">\n  ";
if(runtime.contextOrFrameLookup(context, frame, "support_email")) {
output += "\n    <li class=\"support-email\">\n      ";
output += runtime.suppressValue((lineno = 5, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "emaillink"), "emaillink", [runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "support_email")),"localized_string"),(lineno = 6, colno = 20, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Support Email"]))])));
output += "\n    </li>\n  ";
}
output += "\n  ";
if(runtime.contextOrFrameLookup(context, frame, "support_url")) {
output += "\n    <li class=\"support-url\">\n      <a rel=\"external\" ";
output += runtime.suppressValue(env.getFilter("external_href")(runtime.contextOrFrameLookup(context, frame, "support_url")));
output += ">\n        ";
output += runtime.suppressValue((lineno = 12, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Support Site"])));
output += "</a>\n    </li>\n  ";
}
output += "\n  ";
if(runtime.contextOrFrameLookup(context, frame, "homepage")) {
output += "\n    <li class=\"homepage\">\n      <a rel=\"external\" ";
output += runtime.suppressValue(env.getFilter("external_href")(runtime.contextOrFrameLookup(context, frame, "homepage")));
output += ">";
output += runtime.suppressValue((lineno = 17, colno = 51, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Homepage"])));
output += "</a>\n    </li>\n  ";
}
output += "\n  ";
if(runtime.contextOrFrameLookup(context, frame, "privacy_policy")) {
output += "\n    <li><a href=\"";
output += runtime.suppressValue((lineno = 21, colno = 21, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["app.privacy",[runtime.contextOrFrameLookup(context, frame, "slug")]])));
output += "\">\n      ";
output += runtime.suppressValue((lineno = 22, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Privacy Policy"])));
output += "</a></li>\n  ";
}
output += "\n  <li><a href=\"";
output += runtime.suppressValue((lineno = 24, colno = 19, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["app.abuse",[runtime.contextOrFrameLookup(context, frame, "slug")]])));
output += "\">\n      ";
output += runtime.suppressValue((lineno = 25, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Report Abuse"])));
output += "</a></li>\n</ul>\n";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "settings")),"payment_enabled")) {
output += "\n  ";
output += "\n  ";
var t_1 = runtime.contextOrFrameLookup(context, frame, "upsell");
frame.set("upsell", t_1);
if(!frame.parent) {
context.setVariable("upsell", t_1);
context.addExport("upsell");
}
output += "\n  ";
if(t_1) {
output += "\n    ";
var t_2 = runtime.suppressLookupValue((t_1),"premium_addon");
frame.set("prm", t_2);
if(!frame.parent) {
context.setVariable("prm", t_2);
context.addExport("prm");
}
output += "\n    ";
if(t_2 && (lineno = 32, colno = 29, runtime.callWrap(runtime.suppressLookupValue((t_2),"listed_in"), "prm[\"listed_in\"]", [runtime.makeKeywordArgs({"region": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "request")),"REGION")})]))) {
output += "\n      <a id=\"upsell\" class=\"fatbutton\"\n         href=\"";
output += runtime.suppressValue(env.getFilter("urlparams")((lineno = 34, colno = 32, runtime.callWrap(runtime.suppressLookupValue((t_2),"get_url_path"), "prm[\"get_url_pa\"]", [])),runtime.makeKeywordArgs({"src": "mkt-detail-upsell"})));
output += "\">\n         <span class=\"avail\">";
output += runtime.suppressValue((lineno = 35, colno = 31, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Premium version available"])));
output += "</span>\n         <img class=\"icon\" src=\"";
output += runtime.suppressValue((lineno = 36, colno = 49, runtime.callWrap(runtime.suppressLookupValue((t_2),"get_icon_url"), "prm[\"get_icon_u\"]", [16])));
output += "\">\n         <span class=\"name\">";
output += runtime.suppressValue(runtime.suppressLookupValue((t_2),"name"));
output += "</span>\n      </a>\n    ";
}
output += "\n  ";
}
output += "\n";
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
output += "\n  <div class=\"main content-ratings infobox c\">\n    <div>\n      <h3>\n        ";
output += runtime.suppressValue((lineno = 4, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Rating by the <a href=\"{{ settings.DEJUS_URL }}\" title=\"{{ settings.DEJUS }}\">DEJUS</a>"])));
output += "\n      </h3>\n      ";
frame = frame.push();
var t_2 = (lineno = 6, colno = 43, runtime.callWrap(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "content_ratings")),"values"), "content_ratings[\"values\"]", []));
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
output += "\n        <div class=\"content-rating c\">\n          <div class=\"icon icon-";
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += "\" title=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += "\">";
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"name"));
output += "</div>\n          <p class=\"description\">";
output += runtime.suppressValue(runtime.suppressLookupValue((t_3),"description"));
output += "</p>\n        </div>\n      ";
frame.set("loop.first", false);
}
frame = frame.pop();
output += "\n    </div>\n  </div>\n";
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
output += "\n\n<section class=\"main product-details listing expanded c\">\n  ";
output += "\n  <div class=\"product mkt-tile\">\n    <div class=\"info\">\n      <h3 data-l10n-id=\"loading\">Loading...</h3>\n      <div class=\"price vital\" data-l10n-id=\"loading\">Loading...</div>\n      <div class=\"rating vital unrated\">\n        ";
output += runtime.suppressValue((lineno = 9, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "stars"), "stars", [0])));
output += "\n      </div>\n    </div>\n  </div>\n  <div class=\"tray previews full\"></div>\n</section>\n\n";
output += "\n\n<section class=\"main\" id=\"installed\">\n  <div>\n    <p>\n      ";
output += runtime.suppressValue((lineno = 23, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Installed!"])));
output += "\n    </p>\n    <p class=\"how mac\">\n      ";
output += runtime.suppressValue((lineno = 26, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Launch this app from your <b>Applications</b> directory."])));
output += "\n    </p>\n    <p class=\"how windows\">\n      ";
output += runtime.suppressValue((lineno = 29, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Launch this app from your <b>Windows desktop</b> or <b>Start &#9658; All Programs</b>."])));
output += "\n    </p>\n    <p class=\"how linux\">\n      ";
output += runtime.suppressValue((lineno = 32, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Launch this app from your <b>dash</b>, <b>Application picker</b>, or <b>Applications menu</b>."])));
output += "\n    </p>\n  </div>\n</section>\n<div id=\"purchased-message\"></div>\n\n<section class=\"main blurbs infobox\">\n  <div>\n    <p class=\"summary\">\n      ";
output += runtime.suppressValue((lineno = 41, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Loading Summary..."])));
output += "\n    </p>\n  </div>\n</section>\n\n<section class=\"main reviews c";
output += runtime.suppressValue((runtime.contextOrFrameLookup(context, frame, "add_review")?" add-review":""));
output += "\">\n  <div class=\"ratings-placeholder\">\n    <div id=\"reviews\">\n      <p class=\"not-rated\">\n        ";
output += runtime.suppressValue((lineno = 50, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Loading ratings..."])));
output += "\n      </p>\n    </div>\n  </div>\n</section>\n\n<section id=\"support\" class=\"main infobox support c\">\n  <div></div>\n</section>\n\n<div class=\"content_ratings\"></div>\n";
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
output += "<div class=\"slider\">\n  <ul class=\"content\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "previews"));
output += "</ul>\n</div>\n<div class=\"dots\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "dots"));
output += "</div>\n";
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
output += "\n";
var t_2 = runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"reply") != runtime.contextOrFrameLookup(context, frame, "None");
frame.set("has_reply", t_2);
if(!frame.parent) {
context.setVariable("has_reply", t_2);
context.addExport("has_reply");
}
output += "\n\n<li id=\"review-";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"id"));
output += "\" data-rating=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"rating"));
output += "\"\n    class=\"review";
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"is_flagged")?" flagged":""));
output += " c\">\n  <div class=\"review-inner\">\n    ";
output += runtime.suppressValue((lineno = 6, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "stars"), "stars", [runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"rating"),runtime.makeKeywordArgs({"detailpage": runtime.contextOrFrameLookup(context, frame, "True")})])));
output += "\n    <span class=\"byline\">\n      by <strong>";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"user_name"));
output += "</strong>\n      ";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"for_old_version")) {
output += "\n        ";
output += runtime.suppressValue((lineno = 10, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["for previous version {{version}}",runtime.makeKeywordArgs({"version": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"for_old_version")})])));
output += "\n      ";
}
output += "\n    </span>\n    <div class=\"body\">\n      ";
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"body")));
output += "\n    </div>\n  </div>\n</li>\n";
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
output += "\n\n";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "ratings")),"length")) {
output += "\n  <ul class=\"c ratings-placeholder-inner\"></ul>\n  <div id=\"reviews\">\n    <div class=\"";
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"can_review")?"split":"full"));
output += "\">\n      <a class=\"fatbutton average-rating\" href=\"";
output += runtime.suppressValue((lineno = 6, colno = 52, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["app.ratings",[runtime.contextOrFrameLookup(context, frame, "slug")]])));
output += "\">\n        <span>\n          ";
output += runtime.suppressValue((lineno = 8, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["rating_count",runtime.makeKeywordArgs({"n": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "meta")),"count")})])));
output += "\n        </span>\n        ";
output += runtime.suppressValue((lineno = 10, colno = 14, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "stars"), "stars", [runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "meta")),"average"),runtime.makeKeywordArgs({"detailpage": runtime.contextOrFrameLookup(context, frame, "True")})])));
output += "\n      </a>\n    </div>\n  </div>\n";
}
else {
output += "\n  <div id=\"reviews\">\n    <p class=\"not-rated\">\n      ";
output += runtime.suppressValue((lineno = 17, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["App not yet rated"])));
output += "\n    </p>\n  </div>\n";
}
output += "\n";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"can_review")) {
output += "\n  <div class=\"";
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "ratings")),"length")?"split":"full"));
output += "\">\n    <a class=\"fatbutton\" id=\"add-first-review\" href=\"#\">\n      ";
output += runtime.suppressValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"has_review")?(lineno = 24, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Edit Your Review"])):(lineno = 24, colno = 54, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Write a Review"]))));
output += "</a>\n  </div>\n";
}
output += "\n";
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
output += "<li>\n<a class=\"screenshot thumbnail ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "typeclass"));
output += "\"\n   href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "fullURL"));
output += "\" title=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "caption"));
output += "\">\n  <img alt=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "caption"));
output += "\" src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "thumbURL"));
output += "\">\n</a>\n</li>\n";
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
output += "\n<p class=\"summary\">\n  ";
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.contextOrFrameLookup(context, frame, "summary")));
output += "\n  ";
if(t_1) {
output += "\n    <a href=\"#\" class=\"show-toggle\" data-toggle-text=\"";
output += runtime.suppressValue((lineno = 4, colno = 56, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["less"])));
output += "\">";
output += runtime.suppressValue((lineno = 4, colno = 69, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["more"])));
output += "</a>\n  ";
}
output += "\n</p>\n\n";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "description")),"length") || runtime.contextOrFrameLookup(context, frame, "is_packaged")) {
output += "\n  <div";
if(t_1) {
output += " class=\"collapsed\"";
}
output += ">\n    ";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "description")),"length")) {
output += "\n      <h3>";
output += runtime.suppressValue((lineno = 11, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Description"])));
output += "</h3>\n      <div class=\"description\">";
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.contextOrFrameLookup(context, frame, "description")));
output += "</div>\n    ";
}
output += "\n    ";
if(runtime.contextOrFrameLookup(context, frame, "is_packaged")) {
output += "\n      <h3>";
output += runtime.suppressValue((lineno = 15, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Version"])));
output += "</h3>\n      <div class=\"package-version\">\n        ";
output += runtime.suppressValue((lineno = 17, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["latest_version",runtime.makeKeywordArgs({"version": runtime.contextOrFrameLookup(context, frame, "current_version")})])));
output += "\n      </div>\n      <div class=\"release-notes\">\n        ";
output += runtime.suppressValue(env.getFilter("nl2br")(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "current_version")),"releasenotes")));
output += "\n      </div>\n    ";
}
output += "\n  </div>\n";
}
output += "\n";
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
output += "<span class=\"fragment-error\">\n<b>";
output += runtime.suppressValue((lineno = 1, colno = 5, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Oh no!"])));
output += "</b><br>\n";
output += runtime.suppressValue((lineno = 2, colno = 2, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["An error occurred."])));
output += "\n</span>\n";
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
output += "<div class=\"account\">\n  ";
if(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"logged_in")) {
output += "\n    ";
output += runtime.suppressValue((lineno = 2, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Signed in as {{email}}",runtime.makeKeywordArgs({"email": runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"email")})])));
output += "\n    <a href=\"";
output += runtime.suppressValue((lineno = 3, colno = 17, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["users.logout"])));
output += "\" class=\"sync logout\">\n      (";
output += runtime.suppressValue((lineno = 4, colno = 9, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Log Out"])));
output += ")</a>\n  ";
}
else {
output += "\n    <a class=\"button browserid\" href=\"#\">";
output += runtime.suppressValue((lineno = 6, colno = 43, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Log in / Register"])));
output += "</a>\n  ";
}
output += "\n</div>\n<nav class=\"footer-links c\" role=\"navigation\">\n  <p>\n    <a href=\"";
output += runtime.suppressValue((lineno = 11, colno = 17, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["settings"])));
output += "\">";
output += runtime.suppressValue((lineno = 11, colno = 34, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Account Settings"])));
output += "</a>\n  </p>\n  <p>\n    <a href=\"";
output += runtime.suppressValue((lineno = 14, colno = 17, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["privacy"])));
output += "\">";
output += runtime.suppressValue((lineno = 14, colno = 33, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Privacy Policy"])));
output += "</a>\n    <a href=\"";
output += runtime.suppressValue((lineno = 15, colno = 17, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["terms"])));
output += "\">";
output += runtime.suppressValue((lineno = 15, colno = 31, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Terms of Use"])));
output += "</a>\n  </p>\n</nav>";
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
output += "<li>\n  <a class=\"mkt-tile category\" href=\"";
output += runtime.suppressValue((lineno = 1, colno = 41, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["category",[runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"slug")]])));
output += "\">\n    <div class=\"icon cat-";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"slug"));
output += "\"></div>\n    <h3 class=\"linefit\">";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "this")),"name"));
output += "</h3>\n  </a>\n</li>\n";
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
output += "\n\n<li>";
output += runtime.suppressValue((lineno = 2, colno = 16, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "market_tile"), "market_tile", [runtime.contextOrFrameLookup(context, frame, "this"),runtime.makeKeywordArgs({"link": true,"src": "mkt-home"})])));
output += "</li>\n";
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
output += "<section id=\"featured-home\" class=\"featured full\">\n  <ul class=\"grid c\"></ul>\n</section>\n<section class=\"main categories\">\n  <h2>";
output += runtime.suppressValue((lineno = 4, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Categories"])));
output += "</h2>\n  <ul class=\"grid\"></ul>\n</section>\n";
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
output += "<section>\n  <h2>";
output += runtime.suppressValue((lineno = 1, colno = 8, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Please sign in"])));
output += "</h2>\n  <p>\n    ";
output += runtime.suppressValue((lineno = 3, colno = 6, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Just log in or register with your <a href=\"{{url}}\">Persona</a> account.",runtime.makeKeywordArgs({"url": "https://login.persona.org/"})])));
output += "\n  </p>\n  <footer>\n    <a class=\"button browserid\" href=\"#\">";
output += runtime.suppressValue((lineno = 7, colno = 43, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Log in / Register"])));
output += "</a>\n  </footer>\n</section>";
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
output += "\n";
output += runtime.suppressValue((lineno = 1, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "market_tile"), "market_tile", [runtime.contextOrFrameLookup(context, frame, "this")])));
output += "\n";
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
output += "<section class=\"main account\" id=\"account-settings\">\n  ";
var includeTemplate = env.getTemplate("settings/nav.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += "\n\n  <form class=\"container form-grid\">\n\n    <div class=\"simple-field c\">\n      <div class=\"form-label label\">\n        ";
output += runtime.suppressValue((lineno = 7, colno = 10, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Email"])));
output += "\n      </div>\n      <div class=\"form-col\">\n        <input type=\"text\" id=\"email\" readonly value=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"email"));
output += "\">\n      </div>\n    </div>\n\n    <div class=\"brform simple-field c\">\n      <div class=\"form-label\">\n        <label class=\"\" for=\"id_display_name\">\n          ";
output += runtime.suppressValue((lineno = 17, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Display Name"])));
output += "\n        </label>\n      </div>\n      <div class=\"form-col\">\n        <input name=\"display_name\" value=\"";
output += runtime.suppressValue(runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"display_name"));
output += "\" maxlength=\"50\" type=\"text\" id=\"id_display_name\">\n      </div>\n    </div>\n\n    <div class=\"simple-field c\">\n      <div class=\"form-label\">\n        <label for=\"region\">";
output += runtime.suppressValue((lineno = 27, colno = 30, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Region"])));
output += "</label>\n      </div>\n      <div class=\"form-col\">\n          <select id=\"region\" name=\"region\">\n            ";
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
output += "\n            <option value=\"";
output += runtime.suppressValue(t_3);
output += "\"";
output += runtime.suppressValue((t_3 == runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"region")?" selected":""));
output += ">\n              ";
output += runtime.suppressValue(runtime.suppressLookupValue((t_4),"name"));
output += "</option>\n            ";
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
output += "\n            <option value=\"";
output += runtime.suppressValue(t_5);
output += "\"";
output += runtime.suppressValue((t_5 == runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "user")),"region")?" selected":""));
output += ">\n              ";
output += runtime.suppressValue(runtime.suppressLookupValue((t_6),"name"));
output += "</option>\n            ";
frame.set("loop.first", false);
}
}
frame = frame.pop();
output += "\n          </select>\n      </div>\n    </div>\n\n    <footer class=\"form-footer\">\n      <button type=\"submit\">";
output += runtime.suppressValue((lineno = 40, colno = 30, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Save Changes"])));
output += "</button>\n      <div class=\"extras\">\n        <a href=\"#\" class=\"sync post logout\">\n          ";
output += runtime.suppressValue((lineno = 43, colno = 12, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Log out"])));
output += "\n        </a>\n      </div>\n    </footer>\n  </form>\n</section>\n";
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
output += "\n<li>\n  <a";
if(runtime.suppressLookupValue((runtime.suppressLookupValue((runtime.contextOrFrameLookup(context, frame, "window")),"location")),"pathname") == l_url) {
output += " class=\"sel\"";
}
output += " href=\"";
output += runtime.suppressValue(l_url);
output += "\">\n    ";
output += runtime.suppressValue(l_title);
output += "\n  </a>\n</li>\n";
frame = frame.pop();
return output;
});
context.setVariable("_url", macro_t_1);
output += "\n\n<ul class=\"toggles c\">\n  ";
output += runtime.suppressValue((lineno = 9, colno = 7, runtime.callWrap(macro_t_1, "_url", [(lineno = 9, colno = 11, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["settings"])),(lineno = 9, colno = 26, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Account"]))])));
output += "\n  ";
output += runtime.suppressValue((lineno = 10, colno = 7, runtime.callWrap(macro_t_1, "_url", [(lineno = 10, colno = 11, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["purchases"])),(lineno = 10, colno = 27, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["My Apps"]))])));
output += "\n  ";
output += runtime.suppressValue((lineno = 11, colno = 7, runtime.callWrap(macro_t_1, "_url", [(lineno = 11, colno = 11, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "url"), "url", ["feedback"])),(lineno = 11, colno = 26, runtime.callWrap(runtime.contextOrFrameLookup(context, frame, "_"), "_", ["Feedback"]))])));
output += "\n</ul>\n";
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

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;
 
    // an array that will be populated with substring matches
    matches = [];
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });
 
    cb(matches);
  };
};
 
var names = [JJay, JRutledge, WCushing, JWilson, JBlair, JIredell, TJohnson, WPaterson, JRutledge, SChase, OEllsworth, BWashington, AMoore, JMarshall, WJohnson, HBLivingston, TTodd, GDuvall, JStory, SThompson, RTrimble, JMcLean, HBaldwin, JMWayne, RBTaney, PPBarbour, JCatron, JMcKinley, PVDaniel, SNelson, LWoodbury, RCGrier, BRCurtis, JACampbell, NClifford, NHSwayne, SFMiller, DDavis, SJField, SPChase, WStrong, JPBradley, WHunt, MRWaite, JHarlan1, WBWoods, SMatthews, HGray, SBlatchford, LQLamar, MWFuller, DJBrewer, HBBrown, GShiras, HEJackson, EDEWhite, RWPeckham, JMcKenna, OWHolmes, WRDay, WHMoody, HHLurton, CEHughes1, WVanDevanter, JRLamar, MPitney, JCMcReynolds, LDBrandeis, JHClarke, WHTaft, GSutherland, PButler, ETSanford, HFStone, CEHughes2, OJRoberts, BNCardozo, HLBlack, SFReed, FFrankfurter, WODouglas, FMurphy, JFByrnes, RHJackson, WBRutledge, HHBurton, FMVinson, TCClark, SMinton, EWarren, JHarlan2, WJBrennan, CEWhittaker, PStewart, BRWhite, AJGoldberg, AFortas, TMarshall, WEBurger, HABlackmun, LFPowell, WHRehnquist, JPStevens, SDOConnor, AScalia, AMKennedy, DHSouter, CThomas, RBGinsburg, SGBreyer, JGRoberts, SAAlito, SSotomayor, EKagan];
 
$('#the-basics .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
},
{
  name: 'names',
  displayKey: 'value',
  source: substringMatcher(names)
});
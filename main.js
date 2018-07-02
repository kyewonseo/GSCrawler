const gs_crawler = require('./gs_crawler');

var gtin = "8801007201382"

var test = gs_crawler.getProductByBarcode(gtin)

test.then(function (result) {
  console.log(result);
})

const request = require('request');
const cheerio = require('cheerio')
var product = require('./product.json')

function getProductByBarcode (gtin) {
  return new Promise((result, reject) => {
    var baseUrl = "http://gs1.koreannet.or.kr/";
    var path = "/pr/";
    var url = baseUrl + path;

    var errorMessage_gtin = "gtin is null";
    var errorMessage_res = "can't crawl url"

    if (gtin != null) {
      console.log('url=>', url + gtin);
      request.get(url + gtin, function (err, res, body) {
        console.log('statusCode=>', res.statusCode)

        if (res.statusCode == 200) {
          const $ = cheerio.load(body);
          var product_name = $('div.productview > div.pv_title > h3').text()
          var item_table = $('div.productview > div.pv_title > table.pv_info > tbody > tr > td:nth-child(2)')
          var item_standard_table = $('div.productview > div.contents > table.detail_info > tbody > tr > td')
          // var kan_code_th = $('div.productview > div.pv_title > table.pv_info > tbody > tr > th:nth-child(1)')

          item_table.each(function (num) {
            // console.log('num=>', num)
            // console.log('kan_code=>',$(this).text())
            switch (num) {
              case 0:
                product.kan_code = $(this).text();
                break;
              case 1:
                product.kan = trim_kan_classify_tag($(this).text());
                break;
              case 2:
                product.gtin = $(this).text();
                break;
              case 3:
                break;
              case 4:
                product.manufacturer = $(this).text();
                break;
              case 5:
                product.manufacture_seller = $(this).text();
                break;
              case 6:
                product.company_address = $(this).text();
                break;
              case 7:
                product.phone_number = $(this).text();
                break;
            }
          });

          item_standard_table.each(function (num) {
            // console.log('num=>', num)
            // console.log('kan_code=>',$(this).text())
            switch (num) {
              case 0:
                var standard_list = split_standard_length($(this).text());
                product.width = standard_list[0]
                product.depth = standard_list[1]
                product.height = standard_list[2]
                product.standard_length_unit = standard_list[3]
                break;
              case 1:
                product.weight_pure = trim_weight_tag($(this).text());
                break;
              case 2:
                product.weight_total = trim_weight_tag($(this).text());
                product.weight_unit = get_weight_unit($(this).text());
                break;
            }
          });

          product.product_name = product_name;
          // console.log('product=>',product)
          result(product)
          // return product;

        } else {
          reject(errorMessage_res);
        }
      })
    } else {
      reject(errorMessage_gtin);
    }
  })
}

function trim_kan_classify_tag(kan) {
  var pattern = /(\s*)/g
  var str = kan.replace(pattern, "");
  return str;
}

function split_standard_length(standard_text) {
  var standard_list = [];
  standard_text = standard_text.replace(/(\s*)/g, '')
  var str = standard_text.split('x');
  var unit_start = standard_text.indexOf("(") + 1
  var unit_end = standard_text.indexOf(")")
  var unit = standard_text.substring(unit_start, unit_end)
  // console.log(unit)

  standard_list.push(str[0])
  standard_list.push(str[1])
  standard_list.push(str[2].replace(/([(a-z)])/g, ''))
  standard_list.push(unit)
  // console.log(standard_list);

  return standard_list;
}

function trim_weight_tag(weight) {
  var str = weight.replace(/\D/g, '')

  return str;
}

function get_weight_unit(weight) {
  var str = weight.replace(/[^(a-z)]/g, '').slice(1, -1);

  return str;
}

exports.getProductByBarcode = getProductByBarcode;
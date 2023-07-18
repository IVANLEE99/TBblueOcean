// ==UserScript==
// @name         生意参谋蓝海筛选粉红条2.1
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       You
// @match        *://sycm.taobao.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jianshu.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  setTimeout(() => {
    // 搜索人气
    var uv = document.querySelector('input[value="seIpvUvHits"]');
    enableInputChecked(uv);
    // 搜索热度
    var pv = document.querySelector('input[value="sePvIndex"]');
    disableInputChecked(pv);
    // 点击率
    var cr = document.querySelector('input[value="clickRate"]');
    enableInputChecked(cr);
    // 点击人气
    var ch = document.querySelector('input[value="clickHits"]');
    disableInputChecked(ch);
    // 点击热度
    var cHot = document.querySelector('input[value="clickHot"]');
    disableInputChecked(cHot);
    // 支付转化率
    var pr = document.querySelector('input[value="payConvRate"]');
    enableInputChecked(pr);
    // 在线商品数
    var oc = document.querySelector('input[value="onlineGoodsCnt"]');
    enableInputChecked(oc);
    // 商城点击占比
    var tr = document.querySelector('input[value="tmClickRatio"]');
    enableInputChecked(tr);

    // 往页面插入刷新按钮
    var refreshBtn = document.createElement("button");
    refreshBtn.innerHTML = "<span>刷新粉红条和自动复制</span>";
    refreshBtn.style = "margin-right: 5px; background-color:pink;";
    refreshBtn.className = "ant-btn oui-canary-btn ant-btn-sm";
    refreshBtn.onclick = reRender;
    var monthBtn = document.querySelector("button.oui-canary-btn");
    monthBtn.parentElement.insertBefore(refreshBtn, monthBtn);

    // 每个页面100条数据
    var pageCnt = document.querySelector(
      "#sycm-mc-mq-relate-analysis > div.oui-card-content > div > div.alife-dt-card-common-table-pagination-container > div.alife-dt-card-common-table-page-size-wrapper > div > div > div"
    );
    pageCnt.click();
    pageCnt.click();
  }, 2000);

  setTimeout(() => {
    reRender();

    // 点击第几页按钮事件绑定
    bindPagination();

    // 点击每页数量，事件绑定
    var pageCntItems = document.querySelectorAll(
      "ul.ant-select-dropdown-menu > li"
    );
    pageCntItems.forEach((e) => {
      e.addEventListener("click", () => {
        bindPagination();
        reRender();
      });
    });
  }, 5000);

  function disableInputChecked(inputElement) {
    if (inputElement.checked) {
      inputElement.click();
    }
  }

  function enableInputChecked(inputElement) {
    if (!inputElement.checked) {
      inputElement.click();
    }
  }

  function bindPagination() {
    setTimeout(() => {
      var pageCntItems = document.querySelectorAll("li.ant-pagination-item");
      pageCntItems.forEach((e) => {
        e.addEventListener("click", reRender);
      });
    }, 500);
  }

  function reRender() {
    setTimeout(() => {
      let selectNodes = [];
      var nodeList = document.querySelectorAll("tr.ant-table-row-level-0");
      console.info("重新渲染开始：", nodeList);

      nodeList.forEach((single) => {
        // 重置背景颜色
        single.style.backgroundColor = "white";

        // 单元格
        var cells = single.childNodes;

        // 搜索人气
        var seUv = cells[1].innerText;
        var searchNum = parseFloat(seUv.replace(/,/g, ""));
        //点击率
        var clickRateText = cells[2].innerText;
        var clickRateTextNum = parseFloat(clickRateText.replace(/%/g, ""));
        // 支付转化率
        var pr = cells[3].innerText;
        var payRate = parseFloat(pr.replace(/%/g, ""));
        // 在线商品数
        var oc = cells[4].innerText;
        var onlineProductNum = parseFloat(oc.replace(/,/g, ""));
        // 商城点击占比(天猫)
        var tr = cells[5].innerText;
        var tianMaoRate = parseFloat(tr.replace(/%/g, ""));

        // ====== 以下是指标值设置，可以自定义 ====
        // 搜索人气大于500，
        // 点击率大于5%
        // 支付转化率大于5%-50%，
        // 在线商品数大于15-2000，
        // 商城点击占比(天猫)小于65%
        if (
          searchNum > 500 &&
          clickRateTextNum > 5 &&
          payRate > 5 &&
          payRate < 50 &&
          onlineProductNum > 15 &&
          onlineProductNum < 2000 &&
          tianMaoRate < 65
        ) {
          single.style.backgroundColor = "pink";
          //   7通过以上这些我们可以得出一个蓝海指数公式:搜索人气*点击率*支付转化率*(1-天猫占比)/在线商品数/统计天数 (1或者7) *1000
          //   =L2*M2*N2*(1-P2)/O2/7*1000
          let _searchNum = +searchNum;
          let _clickRateTextNum = +clickRateTextNum / 100;
          let _payRate = +payRate / 100;
          let _onlineProductNum = +onlineProductNum;
          let _tianMaoRate = +tianMaoRate / 100;
          single.tbBlueOceanScore =
            ((_searchNum * _clickRateTextNum * _payRate * (1 - _tianMaoRate)) /
              _onlineProductNum /
              7) *
            1000;
          console.log("single.tbBlueOceanScore:", single.tbBlueOceanScore);
          selectNodes.push(single);
        }
      });
      copyTextToExcel(selectNodes);
    }, 500);
  }

  function copyTextToExcel(rows = []) {
    const table = document.createElement("table");

    for (let i = 0; i < rows.length; i++) {
      const row = table.insertRow();
      const cells = rows[i].childNodes || [];

      for (let j = 0; j < cells.length; j++) {
        const cell = row.insertCell();
        cell.innerText =
          cells[j].innerText && cells[j].innerText.replace(/\n/g, " ");
      }
      const score_cell = row.insertCell();
      score_cell.innerText = rows[i].tbBlueOceanScore || 0;
    }
    // for (let i = 0; i < rows.length; i++) {
    //   const row = rows[i];
    //   table.appendChild(row);
    // }
    const html = table.outerHTML;

    const data = [
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      }),
    ];

    navigator.clipboard.write(data);
  }
})();

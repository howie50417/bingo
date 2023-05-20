// ver.0520.06
function delay(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

//打開止盈止損
function autostop() {
  var element = document.querySelector('.transaction-aside .el-checkbox__input');
  if (element) {
    if (!element.classList.contains('is-checked')) {
      element.click();
    }
  }
}

window.lot = 0;
window.rate = 0.14;
window.count = 70;

async function performSteps(mode) {
  console.log(`模式:${mode} 數量:${window.lot} 止盈止損:${window.rate}% 剩餘次數${window.count}`);

  if (window.lot == 0) return;
  if (window.count == 0) return;
  window.count--;
  let rate = window.rate/100
  let priceNew = Number(document.querySelector('.infoitem-label-price').innerHTML)
  let digitLen = (document.querySelector('.infoitem-label-price').innerHTML).split('.')[1].length
  document.querySelector('.buyamount-input .el-input__inner').value = window.lot;
  document.querySelector('.buyamount-input .el-input__inner').dispatchEvent(new Event('input', { bubbles: true }))
  autostop()
  await delay(500);
  if (mode == 'buy') {
    document.querySelector('.profits-input .el-input__inner').value = (priceNew * (1 + rate)).toFixed(digitLen);
    document.querySelector('.loss-input .el-input__inner').value = (priceNew * (1 - rate)).toFixed(digitLen);
  }
  if (mode == 'sell') {
    document.querySelector('.profits-input .el-input__inner').value = (priceNew * (1 - rate)).toFixed(digitLen);
    document.querySelector('.loss-input .el-input__inner').value = (priceNew * (1 + rate)).toFixed(digitLen);
  }
  document.querySelector('.profits-input .el-input__inner').dispatchEvent(new Event('input', { bubbles: true }))
  document.querySelector('.loss-input .el-input__inner').dispatchEvent(new Event('input', { bubbles: true }))
  await delay(500);
  if (mode == 'buy') {
    document.querySelector('.buy-btn').click();
  }
  if (mode == 'sell') {
    document.querySelector('.sale-btn').click();
  }
  
}

// performSteps()

var currencyPair = document.querySelector('.infoitem-code .code').innerHTML.replace('/','_')

var getChartData = async () => {
  const end = Date.now();
  const start = end - 120 * 60 * 1000;  // 1 hour in milliseconds

  const response = await fetch('https://api.coinw.com/api/v1/public?' +
    new URLSearchParams({
      currencyPair,
      command: 'returnChartData',
      period: 60,
      start: Math.floor(start / 1000),  // Coinw API requires seconds, not milliseconds
      end: Math.floor(end / 1000),
    }));

  if (!response.ok) {
    throw new Error(`Error retrieving chart data: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.code !== '200') {
    throw new Error(`Error retrieving chart data: ${data.msg}`);
  }

  return data.data.map(item => Number(item.close)).reverse();
};


function calculateRSI(prices, period = 14) {
  let gains = [];
  let losses = [];

  // calculate gains and losses
  for(let i = 1; i < prices.length; i++) {
      let change = prices[i] - prices[i-1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // calculate average gain and average loss
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

  // calculate RSI for each period
  let rsi = [];
  for(let i = period - 1; i < gains.length; i++) {
      if(i > period) {
          let gain = gains[i];
          let loss = losses[i];
          avgGain = ((avgGain * (period - 1)) + gain) / period;
          avgLoss = ((avgLoss * (period - 1)) + loss) / period;
      }

      var currentRSI;
      if (avgLoss === 0) {
        currentRSI = 100;
      }
      else if (avgGain === 0) {
        currentRSI = 0;
      }
      else {
        var RS = avgGain / avgLoss;
        RS = isNaN(RS) ? 0 : RS;
        currentRSI = parseFloat((100 - (100 / (1 + RS))).toFixed(2));
      }
      rsi.push(currentRSI);
  }

  return rsi;
}

var priceHistory = []
var rsi26,rsi12

function isBuySell(isFirst) {
  let priceNew = Number(document.querySelector('.infoitem-label-price').innerHTML)
  cRSI26 = calculateRSI(priceHistory, 26)
  cRSI12 = calculateRSI(priceHistory, 12)
  if (isFirst) {
    rsi26 = cRSI26.slice(-2);
    rsi12 = cRSI12.slice(-2);
  } else {
    rsi26.push(cRSI26.slice(-1)[0]);
    rsi12.push(cRSI12.slice(-1)[0]);
    rsi26.shift()
    rsi12.shift()
  }
  console.log(Date())
  console.log(`RSI (26):`, rsi26, `RSI (12):`, rsi12);
  if (rsi26.length != 2) return
  if (rsi12.length != 2) return
  let candle3 = [...priceHistory].filter((item, index) => (priceHistory.length-index-1) % 3 === 0);
  let rsi3 = calculateRSI(candle3, 12).slice(-2)
  console.log(`RSI (26):`, rsi26, `RSI (12):`, rsi12, `RSI 3:`, rsi3);
  if (rsi12[1] > rsi26[1] && rsi12[0] < rsi26[0] && (rsi3[1] - rsi3[0] > 7)) {
    console.log(`###################### BUY 訊號 買入 ${priceNew}  ##########################`);
    performSteps('buy')
  }
  if (rsi12[1] < rsi26[1] && rsi12[0] > rsi26[0] && (rsi3[1] - rsi3[0] < -7)) {
    console.log(`###################### SELL 訊號 賣出 ${priceNew}  ##########################`);
    performSteps('sell')
  }
}

var initPrice = () => {
  getChartData()
    .then(prices => {
      priceHistory = prices
      isBuySell(true)
    })
    .catch(err => console.error(err));
}

initPrice()

function updatePrice() {
  let priceNew = Number(document.querySelector('.infoitem-label-price').innerHTML)
  priceHistory.push(priceNew)
  priceHistory.shift()
  isBuySell(false)
}
setInterval(() => {
  updatePrice()
}, 60 * 1000);  // 60 seconds in milliseconds

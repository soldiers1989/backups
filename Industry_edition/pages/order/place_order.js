// 点餐提交订单

// 引用日志输出
var Journal = require('../JS/tool/journal.js')
//引入签名加密商户号
var Sign = require('../JS/tool/sign.js')
//网络请求
var Request = require("../JS/request/request.js")
//数据接口地址
var Server = require('../JS/request/server_address.js');
//全局通用js
var Currency = require('../JS/tool/currency.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     wx.hideShareMenu();
	  if (options.store_id && options.store_id != "undefined" && options.function_type && options.function_type != "undefined") {
      this.setData({
			store_name: options.store_name,
        function_type: options.function_type,
        store_id: options.store_id,
			table_id: options.table_id,
      })
		get_time(this);
		//初始化页面
		Retry(this)
    } else {
      this.setData({
        show: false,
        retry_an: 0,
        error: 1,
        error_text: "数据加载失败",
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 时间选择器
  delivery_time: function () {
    this.setData({
      mack: true,
    })
  },
  //收货地址列表
  jump_address: function () {
    wx.navigateTo({
      url: '/pages/address/receiving_address',
    })
  },

  //备注
  remark: function (event) {
    var remark = event.detail.value;
    this.setData({
      remark: remark,
    })
  },

  //提交订单
  add_order: function () {
	  this.setData({
		  order: true,
	  })
    place_order(this);
  },
  //修改时间
  time_sele: function(){
    try {
      var time = wx.getStorageSync('time')
      this.setData({
        time: time,
      })
    } catch (e) {
    }
  },
  //重试事件
  retry: function () {
    //初始化页面
    Retry(this);
  }
})


/******************************************普通方法******************************************/
// 页面初始化
function Retry(that) {
	//获取商户号
	Sign.getExtMchid(
		function () {
			//获取购物车数据
			try {
				var buy_goods_list = wx.getStorageSync('buy_goods_list')
				if (buy_goods_list) {
					that.setData({
						buy_goods_list: buy_goods_list,
					})
					//拼接sku
					var sku_info = [];
					var goods_list = buy_goods_list.goods_list;
					for (var g = 0; g < goods_list.length; g++) {
						var sku_goods = goods_list[g].sku_goods;
						if (sku_goods) {
							for (var s = 0; s < sku_goods.length; s++) {
								var practice = sku_goods[s].practice;

								for (var p = 0; p < practice.length; p++) {
									var sku_info_item = {};
									sku_info_item.sku_id = sku_goods[s].sku.goods_sku_id;
									sku_info_item.num = practice[p].num;
									var methods = practice[p].methods;
									var batching = practice[p].batching;
									if (methods) {
										var methods_list = [];
										for (var i = 0; i < methods.length; i++) {
											if (methods[i].item_id) {
												methods_list.push(methods[i].item_id)
											}
										}
										if (methods_list.length > 0) {
											sku_info_item.methods = methods_list;
										}
									}
									if (batching) {
										var batching_list = [];
										for (var i = 0; i < batching.length; i++) {
											if (batching[i].item_id) {
												batching_list.push(batching[i].item_id)
											}
										}
										if (batching_list.length > 0) {
											sku_info_item.batching = batching_list;
										}
									}
									sku_info.push(sku_info_item);
								}
							}
						}
					}
					that.setData({
						sku_info: sku_info,
					})
					//获取金额
					get_money(that, sku_info);

				} else {
					that.setData({
						show: false,
						retry_an: 0,
						error: 1,
						log: 0,
						error_text: "数据加载失败",
					})
				}
			} catch (e) {
				that.setData({
					show: false,
					retry_an: 0,
					error: 1,
					log: 0,
					error_text: "数据加载失败",
				})
			}

		},
		function () {
			that.setData({
				show: false,
				retry_an: 1,
				error: 1,
				log: 0,
				error_text: "商户不存在",
			})
			//关闭加载中动画
			wx.hideLoading();
		},
	)
}
//价格计算（防止计算精度偏差）
Math.formatFloat = function (f, digit) {
  var m = Math.pow(10, digit);
  return Math.round(f * m, 10) / m;
}

/******************************************接口数据调用方法******************************************/

//计算金额
function get_money(that, sku_info) {
  var data = {};
  data['mchid'] = Sign.getMchid();
  data['sign'] = Sign.sign();
  data['store_id'] = that.data.store_id;
  data['type'] = that.data.function_type;
  if (that.data.address) {
    data['address '] = address;
  }
  data['sku_info'] = sku_info;

  Request.request_data(
    Server.COUNT_ORFER_MONEY(),
    data,
    function (res) {
		 //浏览量统计
		 Currency.visit(that);
		 if (res) {
			 that.setData({
				 show: true,
				 calculation: res,
				 total_money: Math.formatFloat(parseFloat(res.packaging_money) + parseFloat(res.deliver_money) + parseFloat(res.goods_money), 2).toFixed(2),
			 })

		 } else {
        that.setData({
          show: false,
          retry_an: 0,
          error: 1,
          log: 0,
          error_text: "数据加载失败",
        })
      }
    },
	 function (res) {
      that.setData({
        show: false,
        retry_an: 0,
        error: 0,
        log: 0,
        error_text: res ,
      })
    },
    function (res) {
      Journal.myconsole("获取到的金额数据：")
      Journal.myconsole(res);
      //关闭加载中动画
      wx.hideLoading();
    })
}


//提交订单
function place_order(that) {

  var token = Sign.getToken();
  if (token) {
    var data = {};
    data["token"] = token;
    data['mchid'] = Sign.getMchid();
    data['sign'] = Sign.sign();
    data['store_id'] = that.data.store_id;
    data['type'] = that.data.function_type;
    data['sku_info'] = that.data.sku_info;
    data['channel'] = '1';
	  if (that.data.table_id){
		  data["table_id"] = that.data.table_id
	 }
    //取餐时间
	 if (that.data.time && that.data.time!='立即取餐') {
      data['time'] = that.data.time.value;
    }
    // 备注
    if (that.data.remark) {
      data['remark'] = that.data.remark;
    }

    Request.request_data(
      Server.ADD_ORDER(),
      data,
      function (res) {
        if (res) {
          that.setData({
            order_no: res.order_no
          });
          wx.showLoading({
            title: '加载中',
          })
          //微信支付
          Currency.chatPaymen(that, res.order_no, that.data.function_type);
          //移除购物车
          try {
            wx.removeStorageSync('buy_goods_list')
          } catch (e) {
          }
        } else {
          wx.showToast({
            title: "创建订单失败",
            icon: 'none',
            duration: 2000
			  })
			  that.setData({
				  order: false,
			  })
        }
      },
      function (res) {
			if (res.errCode == 803002){
				wx.showModal({
					title: '提示',
					showCancel: false,
					content: res.errMsg,
					success: function (res) {
						if (res.confirm) {
							// console.log('用户点击确定')
						}
					}
				})
			}else{
				wx.showToast({
					title: res ? res : "提交订单失败",
					icon: 'none',
					duration: 2000
				})
			}
			that.setData({
				order: false,
			})
      },
      function (res) {
        //关闭加载中动画
			setTimeout(function () {
				wx.hideLoading()
			}, 2000)
        wx.stopPullDownRefresh();
        Journal.myconsole('请求提交订单的数据');
        Journal.myconsole(res);
      });
  } else {
    that.setData({
      show: false,
      retry_an: 0,
      error: 1,
      log: 1,
      error_text: "绑定手机号",
    })
  }
}



//获取时间段
function get_time(that) {
	let data = {};
	data['sign'] = Sign.sign();
	data['mchid'] = Sign.getMchid();
	data['store_id'] = that.data.store_id;
	data['type'] = that.data.function_type;
	Request.request_data(
		Server.TIME_SELECT(),
		data,
		function (res) {
			if (res && res.length > 0) {
				try {
					var time = wx.getStorageSync('time')
					if(time){
						time = time
					}else{
						time="立即取餐"
					}
				} catch (e) {
				}
				that.setData({
					time: time,
				})
			}
		},
		function (res) {
			wx.showToast({
				title: res ? res : "失败！！！",
				icon: 'none',
				duration: 2000
			})
		},
		function (res) {
			Journal.myconsole('时间段请求的数据');
			Journal.myconsole(res);
		});
}

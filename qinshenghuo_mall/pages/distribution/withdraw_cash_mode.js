// 提现账户选择
var MyUtils = require('../base/utils/utils.js');
var MyRequest = require('../base/utils/request_management.js');
var MySign = require('../base/utils/sign.js');
var MyHttp = require('../base/utils/httpurl.js');
var LoginRequest = require('../template/login.js');
//扩展工具js
var Extension = require('../base/utils/Extension_tool.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //页面隐藏
    show_loading_faill: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //隐藏页面转发按钮
    wx.hideShareMenu();
    Refresh(this);
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
    Refresh(this);
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

  //重试事件
  retry_onclick: function () {
    //加载中动画
    wx.showLoading({
      title: '加载中'
    });
    //初始化页面加载
    Refresh(this);
  },

  //选择支付方式
  to_draw_cash: function (e) {
    //缓存选中的支付方式
    try {
      wx.setStorageSync('flag', e.currentTarget.dataset.flag);
      wx.navigateBack({
        delta: 1,
      })
    } catch (e) {
    }
  },

	//登入完成回调
	login_success: function () {
		//加载中动画
		wx.showLoading({
			title: '加载中',
		})
		Refresh(this);
	},

	//登入
	login_an(e) {
		Extension.registerrule(this, function (that) { Refresh(that) }, e);
	},
})


/***************普通方法函数***************/
// 页面初始化
function Refresh(that) {
  MySign.getExtMchid(function () {
	  //授权
	  var openid = Extension.getOpenid();
	  if (!openid) {
		  var login = true;
	  } else {
		  var login = false;
		  //获取分销商信息
		  getDistribution(that);
	  }
	  that.setData({
		  login: login,
	  })
  }, function () {
	  //自定义错误提示
	  Extension.custom_error(that, '2', '页面加载失败', '（商户不存在）', '2');
  });
}

// 显示哪些提现方式   1:微信 2:支付宝 3:银联
function showMethod(that, res) {
  var methods = res.settlement_channel;
  that.setData({
    weChat: false,
    ali: false,
    unionPay: false,
  });
  for (var i=0; i < methods.length; i++) {
    if (methods[i] == 1) {
      that.setData({
        weChat: true,
      });
    } else  if (methods[i] == 2) {
      that.setData({
        ali: true
      });
    } else if (methods[i] == 3) {
      that.setData({
        unionPay: true
      });
    } 
  }

}

/***************接口数据获取方法函数***************/
// 获取分销商信息
function getDistribution(that) {
	var token = MySign.getToken();
	if (!token) {
		Extension.custom_error(that, '3', '登录失效', '', '3');
	} else {
		var data = {};
		data['sign'] = MySign.sign(data);
		data['token'] = token;
		data['mchid'] = MySign.getMchid();
		MyRequest.request_data(
			MyHttp.GETDISTRIBUTION(),
			data,
			function (res) {
				if (res) {
					that.setData({
						show_loading_faill: true,
					});
					if (res.info.status == 2) {
						that.setData({
							anomaly_code: 2,
						});
					} else {
						if (res.info.audit_status == 2) {
							that.setData({
								distribution: res.info,
								anomaly_code: null,
							});
							//获取商户结算方式
							getMethord(that);
						} else {
							that.setData({
								anomaly_code: 2,
							});
						}
					}
				} else {
					//自定义错误提示
					Extension.custom_error(that, '2', '页面加载失败', '', '2');
				}
			},
			function (res) {
				if (res == 2) {
					that.setData({
						show_loading_faill: true,
						anomaly_code: 1,
					});
				} else {
					//错误提示
					Extension.error(that, res);
				}
			},
			function (res) {
				MyUtils.myconsole("请求分销商信息的数据");
				MyUtils.myconsole(res);
				//关闭下拉动画
				wx.stopPullDownRefresh();
				//关闭加载中动画
				wx.hideLoading();
			})
	}
}



//获取商户结算方式
function getMethord(that) {
  var mchid = MySign.getMchid();
  var data = {};
  data['sign'] = MySign.sign(data);
  data['mchid'] = mchid;
  MyRequest.request_data(
    MyHttp.GETPAYMETHOD(),
    data,
    function (res) {
      if (res) {
        that.setData({
          show_loading_faill: true,
          data: res,
        });
        // 显示哪些提现方式
        showMethod(that, res);
		} else {
			//自定义错误提示
			Extension.custom_error(that, '3', '暂无结算方式信息', '', '');
      }
    },
	  function (res) {
		  //错误提示
		  Extension.error(that, res);
		},
		function (res) {
			MyUtils.myconsole("请求商户结算方式的数据：")
			MyUtils.myconsole(res);
			//关闭下拉动画
			wx.stopPullDownRefresh();
			//关闭加载中动画
			wx.hideLoading();
		})

}
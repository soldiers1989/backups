// 商户设置
Page({

  /**
   * 页面的初始数据
   */
  data: {
	  current: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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

  //点击切换
  swiper_current: function(e) {
	  var current = e.currentTarget.dataset.current;
	  this.setData({
		  current: current,
	  })
  },
	// 滑动切换
  change: function(e) {
	  var current = e.detail.current;
	  this.setData({
		  current: current,
	  })
  },

  //添加门店
	jump_add: function (e) {
		wx.navigateTo({
			url: '/pages/store/add_editor',
		})
	},

	//门店管理
	jump_store: function (e) {
		wx.navigateTo({
			url: '/pages/store/manage',
		})
	},

	//商户设置跳转
	jump_url: function (e) {
		var url = e.currentTarget.dataset.url;
		wx.navigateTo({
			url: url,
		})
	}
})
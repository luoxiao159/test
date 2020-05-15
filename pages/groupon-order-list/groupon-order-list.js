// pages/groupon-order-list/groupon-order-list.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Zan = require('../../vendor/ZanUI/index');
const app = getApp();

Page(Object.assign({}, Zan.Tab, app.Methods, {
    data: Object.assign({}, app.Variables, {
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderListData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '拼团订单',
        currency: app.data.currency,
        orders: [],
        bottomStyle: null,
        tabSelected: 'all',
        tabList: [{
                id: 'all',
                title: '全部'
            },
            {
                id: 'pending',
                title: '待付款'
            },
            {
                id: 'pending_groupon',
                title: '待成团'
            },
            {
                id: 'processing',
                title: '已成团'
            },
            {
                id: 'expired',
                title: '已失效'
            }
        ]
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderListData */
    }),
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderListEvents */
    loginBack2: true,
    page: 1,
    options: null,
    // 选项卡变更
    handleZanTabChange({
        componentId,
        selectedId
    }) {
        if (componentId == 'order-tab') {
            this.setData({
                tabSelected: selectedId
            });
            this.options.status = selectedId;
            this.refreshOrderData();
        }
    },
    // 取消订单
    cancelOrder(e) {
        var dataset = e.currentTarget.dataset;
        app.cancelOrder({
            id: dataset.id,
            success: data => {
                var toast = {};
                if (data.success == true) {
                    toast.title = '已取消';
                    this.changeOrderStatus(dataset.index, 'cancelled');
                } else {
                    toast.title = '取消失败，请稍后再试';
                    toast.icon = 'none';
                }
                wx.showToast(toast);
            }
        });
    },
    // 打开支付方式弹窗
    openPaymentChoosePopup(e) {
        this.setData({
            popupOrder: e.currentTarget.dataset,
            isPaymentChoosePopup: true
        });
    },
    // 关闭支付方式弹窗
    closePaymentChoosePopup() {
        this.setData({
            isPaymentChoosePopup: false
        });
    },
    // 提示引导打开浏览器
    showCopyPayURL(e) {
        this.closePaymentChoosePopup();
        var index = e.currentTarget.dataset.index;
        wx.showModal({
            title: '提示',
            content: '当前支付方式需要复制支付链接到浏览器打开完成支付',
            showCancel: true,
            confirmText: '复制链接',
            confirmColor: this.data.mainColor,
            success: res => {
                if (res.confirm) {
                    var url = this.data.orders[index].pay_url + '&w2w_session=' + app.data.w2w_session;
                    app.setClipboard(url);
                }
            }
        })
    },
    makeWeChatPayment(e) {
        this.closePaymentChoosePopup();
        this.makePayment(e);
    },
    // 发起支付
    makePayment(e) {
        var dataset = e.currentTarget.dataset;
        app.requestPayment({
            id: dataset.id,
            success: res => {
                wx.showToast({
                    title: '已支付',
                    success: () => {
                        this.changeOrderStatus(dataset.index, 'processing');
                    }
                });
            },
            fail: res => {
                if (res.errMsg == 'requestPayment:fail cancel') {
                    return;
                }
                var msg = res.err_code_des || '支付暂时出现问题，请稍候再试';
                wx.showToast({
                    icon: 'none',
                    title: msg,
                });
            }
        })
    },
    // 改变页面订单状态
    changeOrderStatus(index, status) {
        var orders = this.data.orders;
        orders[index].status = status;
        orders[index]['status_name'] = app.Util.getOrderStatus(orders[index].status);
        this.setData({
            orders: orders
        });
    },
    // 跳转订单详情
    goOrderDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/order-detail/order-detail?id=' + id
        })
    },
    goProductDetail() {},
    loadData(clear = false) {
        if (this.data.bottomStyle == 'nomore' || this.data.bottomStyle == 'empty') {
            if (this.page != 1) {
                wx.showToast({
                    icon: 'none',
                    title: '没有更多了~'
                })
            }
            return;
        }

        var params = {
            w2w_session: app.data.w2w_session,
            w2w_groupon_order: true,
            page: this.page
        };
        if (this.options.status != 'all') params.status = this.options.status;

        app.Util.network.GET({
            url: app.API('orders'),
            params: params,
            success: data => {
                var orders = data;
                if (!clear) {
                    var setdata = {};
                    var offset = (this.page - 1) * 10;
                    for (var i = 0; i < data.length; i++) {
                        setdata['orders[' + (offset + i) + ']'] = data[i];
                    }
                    setdata.page = this.page;
                    this.setData(setdata);
                } else {
                    this.setData({
                        orders: orders
                    })
                }

                if (data.length == 0) {
                    this.setData({
                        bottomStyle: (this.page == 1 ? 'empty' : 'nomore')
                    });
                    if (this.page != 1) {
                        wx.showToast({
                            icon: 'none',
                            title: '没有更多了~'
                        })
                    }
                    return;
                }

                this.page++;
            }
        });
    },
    refreshOrderData() {
        this.page = 1;
        this.setData({
            tabSelected: this.options.status,
            bottomStyle: null
        });
        wx.pageScrollTo({
            scrollTop: 0
        })
        this.loadData(true);
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });

        this.options = options;
        if (!this.options.status) this.options.status = this.data.tabList[0].id;
        wx.hideShareMenu();

        this.checkLogin(() => {
            this.refreshOrderData();
        });
    },
    onShareAppMessage(e) {
        var index = e.target.dataset.index,
            order = this.data.orders[index];
        return app.getShareInfo({
            title: '【仅剩' + order.groupon.member_remain + '人】快来拼' + order.groupon.product_name,
            path: '/pages/groupon-result/groupon-result',
            params: {
                groupon_id: order.id
            },
            imageUrl: order.groupon.product_image,
        });
    },
    onShow() {

    },
    onPullDownRefresh() {
        this.refreshOrderData();
    },
    onReachBottom() {
        this.loadData();
    }
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderListEvents */
}))
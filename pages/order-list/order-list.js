// pages/order-list/order-list.js

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
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '我的订单',
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
                id: 'processing',
                title: '待发货'
            },
            {
                id: 'shipped',
                title: '待收货'
            },
            {
                id: 'completed',
                title: '待评价'
            }
        ]
    }),
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
                wx.showToast({
                    title: '已取消'
                });
                this.changeOrderStatus(dataset.index, 'cancelled');
            }
        });
    },
    // 立即支付按钮点击
    payBtnClick(e) {
        if (app.data.paymentPopup) {
            this.openPaymentChoosePopup(e);
        } else {
            this.makePayment(e);
        }
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
        this.setData({
            ['orders[' + index + '].status']: status,
            ['orders[' + index + '].status_name']: app.Util.getOrderStatus(status),
        });
    },
    // 跳转订单详情
    goOrderDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/order-detail/order-detail?id=' + id
        })
    },
    // 跳转物流详情
    goShippingDetail(e) {
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/shipping-detail/shipping-detail?id=' + id
        })
    },
    // 确认收货
    confirmOrderReceived(e) {
        var id = e.currentTarget.dataset.id,
            index = e.currentTarget.dataset.index;
        app.confirmOrderReceived({
            id: id,
            success: data => {
                wx.showToast({
                    title: '已确认'
                });
                this.changeOrderStatus(index, 'completed');
                this.setData({
                    ['orders[' + index + '].reviewed']: false
                });
            }
        });
    },
    // 跳转评价列表
    goOrderReviewList(e) {
        var id = e.currentTarget.dataset.id,
            index = e.currentTarget.dataset.index;
        if (this.data.orders[index].line_items.length == 1) {
            wx.navigateTo({
                url: '/pages/order-review-post/order-review-post?id=' + id + '&itemID=' + this.data.orders[index].line_items[0].id
            })

        } else {
            wx.navigateTo({
                url: '/pages/order-review-list/order-review-list?id=' + id
            })
        }
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
            this.loadData();
        });
    },
    onShareAppMessage(e) {
        var type = e.target.dataset.type,
            index = e.target.dataset.index,
            order = this.data.orders[index];

        if (type == 'paybyfriend') {
            return app.getShareInfo({
                title: '我看中了一件好货，快帮我付款吧~',
                path: '/pages/order-detail/order-detail',
                params: {
                    id: order.id,
                    paybyfriend_token: order.paybyfriend_token
                },
                imageUrl: order.line_items[0].image[0].single.url,
                appReportInviter: true
            });
        }
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderShare */
        else if (type == 'groupon') {
            return app.getShareInfo({
                title: '【仅剩' + order.groupon.member_remain + '人】快来拼' + order.groupon.product_name,
                path: '/pages/groupon-result/groupon-result',
                params: {
                    groupon_id: order.id
                },
                imageUrl: order.groupon.product_image
            });
        }
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponOrderShare */
    },
    onShow() {
        // 如果从订单详情页返回则只刷新当前页的订单
        if (app.isEnterOrderDetail && this.page > 1) {
            this.page--;
            this.loadData();
            delete app.isEnterOrderDetail;
        }
    },
    onPullDownRefresh() {
        this.refreshOrderData();
    },
    onReachBottom() {
        this.loadData();
    }
}))
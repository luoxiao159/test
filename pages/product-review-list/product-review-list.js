// pages/product-review-list/product-review-list.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const ReviewUitls = require('../../utils/review-utils.js');
const app = getApp();

Page(Object.assign({}, app.Methods, ReviewUitls.methods, {
    data: Object.assign({}, app.Variables, ReviewUitls.variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '产品评价',
        logo: app.data.logo,
    }),
    page: 1,
    loadData() {
        if (this.data.bottomStyle == 'nomore' || this.data.bottomStyle == 'empty') {
            if (this.page != 1) {
                wx.showToast({
                    icon: 'none',
                    title: '没有更多了~'
                })
            }
            return;
        }
        app.Util.network.GET({
            url: app.API('product_review'),
            params: {
                product_id: this.options.id,
                page: this.page
            },
            success: data => {
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

                var setdata = {};
                var offset = (this.page - 1) * 10;
                var reviewImages = this.data.reviewImages || [];
                for (var i = 0; i < data.length; i++) {
                    setdata['reviews[' + (offset + i) + ']'] = data[i];
                    var reviewImagesLength = reviewImages.length,
                        imageOffset = 0;
                    for (var j = reviewImagesLength; j < reviewImagesLength + data[i].images.length; j++) {
                        setdata['reviewImages[' + j + ']'] = data[i].images[imageOffset];
                        reviewImages.push(data[i].images[imageOffset]);
                        imageOffset++;
                    }
                }
                this.setData(setdata);
                this.page++;
            }
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length,
            reviews: [],
            bottomStyle: null,
        });

        this.options = options;
        // 获取产品评价
        this.page = 1;
        this.loadData();
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    onReachBottom() {
        this.loadData(false);
    }
}))
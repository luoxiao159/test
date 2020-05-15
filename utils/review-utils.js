// pages/utils/review-methods.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

var methods = {
    // 回复评价
    submitReply(e) {
        var app = getApp();

        var content = '';
        // 表单提交
        if (typeof e.detail.value == 'object') {
            content = e.detail.value.content;
        }
        // 输入框完成提交
        else {
            content = e.detail.value;
        }

        if (content == '') {
            wx.showToast({
                icon: 'none',
                title: '请输入回复内容',
            })
            return;
        }

        this.checkLogin(() => {
            app.Util.network.POST({
                url: app.API('product_review_reply'),
                params: {
                    w2w_session: app.data.w2w_session,
                    product_id: this.options.id,
                    comment_parent: this.data.replyTo.id,
                    comment: content,
                    //form_id: e.detail.formId
                },
                success: data => {
                    wx.showToast({
                        title: '已提交'
                    })
                    this.closeReplyPopup();
                },
                fail: data => {
                    wx.showToast({
                        icon: 'none',
                        title: data.message
                    })
                }
            });
        });
    },
    // 打开回复弹窗
    openReplyPopup(e) {
        var dataset = e.currentTarget.dataset;
        this.setData({
            replyTo: dataset,
            isReplyPopup: true
        });
    },
    // 关闭回复弹窗
    closeReplyPopup() {
        this.setData({
            isReplyPopup: false,
            replyInputValue: '',
        });
    },
    // 评价全屏查看图片
    reviewViewFullScreen(e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: this.data.reviewImages
        })
    },
    // 加载更多回复
    loadMoreReply(e) {
        var app = getApp();
        var dataset = e.currentTarget.dataset,
            index = dataset.index,
            parent = dataset.id,
            page = this.data.reviews[index].page || 2,
            bottomStyle = this.data.reviews[index].bottomStyle || null;

        if (bottomStyle == 'nomore') {
            wx.showToast({
                icon: 'none',
                title: '没有更多了~'
            })
            return;
        }

        app.Util.network.GET({
            url: app.API('product_review'),
            params: {
                product_id: this.options.id,
                parent: parent,
                page: page
            },
            success: data => {

                if (data.length == 0) {
                    this.setData({
                        ['reviews[' + index + '].bottomStyle']: 'nomore'
                    });
                    wx.showToast({
                        icon: 'none',
                        title: '没有更多了~'
                    })
                    return;
                }

                var setdata = {};
                var offset = (page - 1) * 10;
                for (var i = 0; i < data.length; i++) {
                    setdata['reviews[' + index + '].children.[' + (offset + i) + ']'] = data[i];
                }
                page++;
                setdata['reviews[' + index + '].page'] = page;
                this.setData(setdata);
            }
        });
    }
}

var variables = {
    reviewText: [
        '失望',
        '一般',
        '满意',
        '喜欢',
        '超爱'
    ],
    reviewImages: [],
}

module.exports.methods = methods;
module.exports.variables = variables;
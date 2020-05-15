// pages/order-review-post/order-review-post.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '发布评价',
        currency: app.data.currency,
        order: null,
        reviewPlaceholder: [
            '是什么让你这么失望啦？吐槽给我吧！',
            '有什么好的建议可以帮助我们改进的吗？',
            '在哪些方面改进，会让你更满意呢？',
            '还不错吧？吐槽和建议都可以分享给网友哦！',
            '外形如何？品质如何？写写你的感受吧！'
        ],
        reviewText: [
            '失望',
            '一般',
            '满意',
            '喜欢',
            '超爱'
        ],
        uploading: false,
        uploadImagesLimit: 6,
        selectedImages: []
    }),
    uploadTask: [],
    // 评星点击
    rateChange(e) {
        var rate = e.currentTarget.dataset.rate;
        this.setData({
            rate: rate
        });
    },
    // 评价输入
    reviewInput(e) {
        var content = e.detail.value;
        this.setData({
            contentLength: content.length
        });
    },
    // 图片选择
    selectImage() {
        if (this.data.uploading) {
            return;
        }
        wx.chooseImage({
            count: this.data.uploadImagesLimit - this.data.selectedImages.length,
            sizeType: 'compressed',
            success: res => {
                for (var i in res.tempFilePaths) {
                    this.data.selectedImages.push(res.tempFilePaths[i]);
                }
                this.setData({
                    selectedImages: this.data.selectedImages
                });
            }
        })
    },
    // 全屏看图
    previewImage(e) {
        var index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: this.data.selectedImages[index],
            urls: this.data.selectedImages
        })
    },
    // 移除图片
    removeImage(e) {
        var index = e.currentTarget.dataset.index;
        this.data.selectedImages.splice(index, 1);
        this.setData({
            selectedImages: this.data.selectedImages
        });
    },
    // 提交评价
    reviewSubmit(e) {
        if (this.data.uploading) {
            return;
        }
        if (this.data.rate == undefined) {
            wx.showToast({
                icon: 'none',
                title: '请选择评星'
            })
            return;
        }

        var content = this.form && this.form.content ? this.form.content : '';
        if (content.length == 0) {
            wx.showToast({
                icon: 'none',
                title: '请输入评价内容'
            })
            return;
        } else if (content.length < 10) {
            wx.showModal({
                title: '',
                content: '很多优秀的评价都是在10个字以上的，\r\n真的不多写点就提交了吗？',
                cancelText: '再想想',
                cancelColor: this.data.mainColor,
                confirmText: '提交',
                confirmColor: '#444',
                success: res => {
                    if (res.confirm) {
                        this.submit(content);
                    }
                }
            })
        } else if (content.length > 500) {
            wx.showToast({
                icon: 'none',
                title: '评价内容超过500字'
            })
            return;
        } else {
            this.submit(content);
        }
    },
    // 提交
    submit(content) {
        this.setData({
            uploading: true
        });
        app.Util.network.POST({
            url: app.API('product_review'),
            params: {
                w2w_session: app.data.w2w_session,
                order_id: this.options.id,
                line_item_id: this.options.itemID,
                comment: content,
                rating: this.data.rate + 1,
                //form_id: formId
            },
            success: data => {
                if (this.data.selectedImages.length > 0) {
                    this.uploadImage(0, data.id);
                } else {
                    this.reviewDone();
                }
            },
            fail: data => {
                wx.showToast({
                    icon: 'none',
                    title: data.message
                })
            }
        });
    },
    // 上传图片
    uploadImage(i, commentID) {
        var uploadTask = wx.uploadFile({
            url: app.API('product_review_image'),
            filePath: this.data.selectedImages[i],
            formData: {
                w2w_session: app.data.w2w_session,
                comment_id: commentID
            },
            name: 'image',
            success: res => {
                if (i < this.data.selectedImages.length - 1) {
                    i++;
                    this.uploadImage(i, commentID);
                } else {
                    this.reviewDone();
                }
            },
            fail: res => {
                wx.showToast({
                    icon: 'none',
                    title: '上传失败'
                })
                this.setData({
                    ['progress[' + i + ']']: false
                });
            }
        })
        uploadTask.onProgressUpdate(res => {
            this.setData({
                ['progress[' + i + ']']: res.progress
            });
        })
    },
    // 评价完成
    reviewDone() {
        wx.showToast({
            title: '已提交',
            success: () => {
                setTimeout(() => {
                    wx.navigateBack();
                }, 1500)
            }
        })
    },
    onLoad(options) {
        this.setData({
            itemID: options.itemID,
            currentPages: getCurrentPages().length
        });
        this.options = options;
        app.Util.network.GET({
            url: app.API('order') + options.id,
            params: {
                w2w_session: app.data.w2w_session
            },
            success: data => {
                this.setData({
                    order: data
                });
            }
        });
    },
}))
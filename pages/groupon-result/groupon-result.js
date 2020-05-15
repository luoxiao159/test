// pages/groupon-result/groupon-result.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const Timer = require('../../utils/wxTimer.js');
const app = getApp();

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponResultData */
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: '拼团详情',
        currency: app.data.currency,
        wxTimerList: {},
        /* W2W Extension, Name: w2w-products-groupon, Code: grouponResultData */
    }),
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponResultEvents */
    // 打开分享弹窗
    openSharePopup() {
        this.setData({
            isSharePopup: true
        });
    },
    // 关闭分享弹窗
    closeSharePopup() {
        this.setData({
            isSharePopup: false
        });
    },
    // 打开规则弹窗
    openGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: true
        });
    },
    // 关闭规则弹窗
    closeGrouponRulePopup() {
        this.setData({
            isGrouponRulePopup: false
        });
    },
    // 打开海报弹窗
    openPosterPopup(posterImage) {
        this.setData({
            isPosterPopup: true,
            posterImage: posterImage
        });
    },
    // 关闭海报弹窗
    closePosterPopup() {
        this.setData({
            isPosterPopup: false
        });
    },
    loginSuccess() {
        this.load();
    },
    // 拼团结算
    goGrouponCheckout() {
        var needReload = !app.isLoggedIn();
        this.checkLogin(() => {
            if (needReload) {
                this.load(data => {
                    if (!data.is_grouped_on) {
                        if (data.is_success) {
                            wx.showModal({
                                title: '提示',
                                content: '哎呀~此团已经满员了，开一个新团吧',
                                confirmText: '去开团',
                                confirmColor: this.data.mainColor,
                                success: res => {
                                    if (res.confirm) {
                                        this.goProductDetail(this.data.groupon.product_id);
                                    }
                                }
                            })
                        } else {
                            wx.navigateTo({
                                url: '/pages/groupon-checkout/groupon-checkout?groupon_id=' + this.options.groupon_id,
                            })
                        }
                    }
                });
            } else {
                wx.navigateTo({
                    url: '/pages/groupon-checkout/groupon-checkout?groupon_id=' + this.options.groupon_id,
                })
            }
        });
    },
    goGrouponProduct(e) {
        var id = e.currentTarget.dataset.id
        this.goProductDetail(id);
    },
    goProductDetail(id) {
        wx.navigateTo({
            url: '/pages/product-detail/product-detail?id=' + id,
        })
    },
    load(callback = () => {}) {
        app.Util.network.GET({
            url: app.API('groupon_detail'),
            params: Object.assign({}, {
                groupon_id: this.options.groupon_id
            }, app.isLoggedIn() ? {
                w2w_session: app.data.w2w_session
            } : {}),
            success: data => {
                if (this.wxTimer) {
                    this.wxTimer.stop();
                }
                var date1 = new Date(),
                    date2 = new Date(data.expire.replace(/\-/g, '/')),
                    diff = app.Util.diffTime(date1, date2);

                if (date1.getTime() < date2.getTime()) {
                    this.wxTimer = new Timer({
                        beginTime: diff.hours + ':' + diff.minutes + ':' + diff.seconds,
                        days: diff.days,
                        showDay: false,
                        name: 'timerCountDown',
                        intervalFn: (i, timerObj) => {
                            this.setData({
                                grouponCountDown: timerObj
                            });
                        }
                    })
                    this.wxTimer.start(this);
                } else {
                    this.setData({
                        grouponCountDown: {
                            hours: '00',
                            minutes: '00',
                            seconds: '00'
                        }
                    });
                }
                /* 隐藏菜单分享 */
                if (data.dismiss || data.is_success || !data.is_grouped_on) {
                    wx.hideShareMenu();
                }

                this.setData({
                    groupon: data
                }, () => {
                    callback(data)
                });
            }
        });
    },
    // 分享海报
    sharePoster() {
        app.Util.network.GET({
            url: app.API('groupon_qrcode'),
            params: {
                id: this.options.groupon_id,
                w2w_session: app.data.w2w_session
            },
            success: data => {
                wx.showLoading({
                    title: '正在生成海报',
                    mask: true,
                });
                wx.getImageInfo({
                    src: data.url,
                    success: qrcodeRes => {

                        console.log('二维码图片本地位置', qrcodeRes.path);
                        wx.getImageInfo({
                            src: app.data.userInfo.avatarUrl,
                            success: avatarRes => {

                                console.log('头像本地位置', avatarRes.path);
                                wx.getImageInfo({
                                    src: this.data.groupon.poster_product_image,
                                    success: res => {

                                        console.log('产品图片本地位置', res.path);
                                        var resize = app.Util.resizeRect(res.width, res.height, 300, 300);
                                        this.createPoster(res.path, qrcodeRes.path, avatarRes.path, this.data.groupon, resize);
                                    },
                                    fail: res => {
                                        wx.hideLoading();
                                        wx.showToast({
                                            icon: 'none',
                                            title: '下载图片失败'
                                        })
                                    }
                                });
                            },
                            fail: res => {
                                wx.hideLoading();
                                wx.showToast({
                                    icon: 'none',
                                    title: '下载图片失败'
                                })
                            }
                        });
                    },
                    fail: res => {
                        wx.hideLoading();
                        wx.showToast({
                            icon: 'none',
                            title: '下载图片失败'
                        })
                    }
                })
            }
        });
    },
    // 生成分享海报
    createPoster(image, qrcode, avatar, groupon, resize) {
        var context = wx.createCanvasContext('poster_canvas');
        context.drawImage(app.data.grouponPoster, 0, 0); // 绘制海报背景
        /* 绘制头像开始 */
        var r = 70,
            avatarX = 350,
            avatarY = 376.5;
        context.save();
        context.beginPath();
        context.arc(avatarX + r, avatarY + r, r, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(avatar, avatarX, avatarY, r * 2, r * 2);
        context.restore();
        /* 绘制头像结束 */
        context.drawImage(image, resize.sX, resize.sY, resize.sWidth, resize.sHeight, resize.dX + (840 - resize.dWidth) * 0.5, resize.dY + 580, resize.dWidth, resize.dHeight); // 绘制首产品图
        context.drawImage(qrcode, 100, 1270, 166, 166); // 绘制二维码
        context.setFillStyle('#888');
        context.setFontSize(28);
        context.fillText('分享自 ' + app.data.name, 322, 1390);
        this.drawProductMeta(context, groupon); // 产品信息
        context.draw(false, () => {
            wx.canvasToTempFilePath({
                canvasId: 'poster_canvas',
                success: res => {
                    var tempFilePath = res.tempFilePath;
                    wx.hideLoading();
                    console.log('海报图片路径', res.tempFilePath);
                    this.closeSharePopup();
                    this.openPosterPopup(res.tempFilePath);
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        });
    },
    // 绘制标题、短描述、价格
    drawProductMeta(context, groupon) {
        context.setFillStyle('#f4e6a5');
        context.setTextAlign('center');
        context.font = 'lighter 10px sans-serif';

        var lineStartX = 420,
            lineStartY = 960;

        var title = groupon.product_name,
            excerpt = groupon.product_desc;

        var titleLineHeight = 45,
            excerptLineHeight = 35;

        // 绘制标题
        context.setFontSize(40);
        var titleArr = app.Util.canvasSplitText(context, title, 600);

        for (var i in titleArr) {
            if (i > 0) {
                break;
            }
            var text = titleArr[i];
            if (i == 0 && titleArr.length > 1) {
                text = text.substr(0, text.length - 1) + '...';
            }
            context.fillText(text, lineStartX, lineStartY);
            lineStartY += titleLineHeight;
        }

        // 绘制短描述
        context.setFontSize(26);
        lineStartY = lineStartY - titleLineHeight + 50;

        var excerptArr = app.Util.canvasSplitText(context, excerpt, 580);
        for (var i in excerptArr) {
            if (i > 1) {
                break;
            }
            var text = excerptArr[i];
            if (i == 1 && excerptArr.length > 2) {
                text = text.substr(0, text.length - 1) + '...';
            }
            context.fillText(text, lineStartX, lineStartY);
            lineStartY += excerptLineHeight;
        }

        // 绘制价格
        lineStartX = 415;
        lineStartY = lineStartY - excerptLineHeight + 90;

        var text, metrics, textWidth;

        context.setTextAlign('right');
        text = app.data.currency + groupon.product_groupon_price;
        context.setFontSize(50);
        context.fillText(text, lineStartX, lineStartY);


        lineStartX = 445;
        context.setTextAlign('left');
        text = app.data.currency + groupon.product_price;
        context.setFontSize(26);
        context.fillText(text, lineStartX, lineStartY);
        metrics = context.measureText(text);
        textWidth = metrics.width;

        context.setLineWidth(2);
        context.setStrokeStyle('#f4e6a5');
        context.moveTo(lineStartX, lineStartY - 9);
        context.lineTo(lineStartX + textWidth, lineStartY - 9);
        context.stroke();
        context.save();
    },
    // 保存海报
    savePoster() {
        wx.saveImageToPhotosAlbum({
            filePath: this.data.posterImage,
            success: result => {
                this.closePosterPopup();
                wx.showModal({
                    title: '提示',
                    content: '海报已存入手机相册，赶快分享吧~',
                    showCancel: false,
                    confirmColor: this.data.mainColor
                })
            },
            fail: err => {
                console.log('保存海报错误', err);
                this.closePosterPopup();
                if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
                    wx.showToast({
                        icon: 'none',
                        title: '请到设置中打开保存图片权限'
                    })
                }
            }
        });
    },
    onLoad(options) {
        this.setData({
            currentPages: getCurrentPages().length
        });
        if (options.scene) {
            var scene = app.Util.queryStrToObj(decodeURIComponent(options.scene));
            options = Object.assign({}, options, scene);
        }
        this.options = options;
        app.checkLogin({
            success: () => {
                this.loginSuccess();
                /* W2W Extension, Name: w2w-products-distribution, Code: loginSuccessReportInviter */
                this.reportInviter();
                /* W2W Extension, Name: w2w-products-distribution, Code: loginSuccessReportInviter */
            },
            fail: () => {
                /* W2W Extension, Name: w2w-products-distribution, Code: loginFailReportInviter */
                // 静默登录
                app.login(null, () => {
                    this.reportInviter();
                });
                /* W2W Extension, Name: w2w-products-distribution, Code: loginFailReportInviter */
                //this.openLoginPopup();
            }
        });
    },
    onShareAppMessage() {
        this.closeSharePopup();
        return app.getShareInfo({
            title: '【仅剩' + this.data.groupon.member_remain + '人】快来拼' + this.data.groupon.product_name,
            path: '/pages/groupon-result/groupon-result',
            params: {
                groupon_id: this.options.groupon_id
            },
            imageUrl: this.data.groupon.product_image,
        });
    },
    onShow() {
        if (this.wxTimer) {
            this.wxTimer.calibration();
        }
        this.load();
    },
    onPullDownRefresh() {
        this.load();
    },
    /* W2W Extension, Name: w2w-products-groupon, Code: grouponResultEvents */
}))
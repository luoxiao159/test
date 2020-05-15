// pages/page-detail/page-detail.js

/**
 * Project: WooCommerce微信小程序
 * Description: 将WooCommerce商城接入微信小程序
 * Author: 
 * Organization: 
 */

const app = getApp();
// const Txv = requirePlugin('txvideo');

Page(Object.assign({}, app.Methods, {
    data: Object.assign({}, app.Variables, {
        NAV_HEIGHT: wx.STATUS_BAR_HEIGHT + wx.DEFAULT_HEADER_HEIGHT + 'px',
        NAV_BAR_HEIGHT: wx.DEFAULT_HEADER_HEIGHT + 'px',
        pageTitle: app.data.name,
        post: null,
        showNaviBar: false,
        naviShowHeight: 100,
    }),
    page: 2,
    // 点击自定义封面播放视频 - 详情
    playDetailVideo(e) {
        var dataset = e.detail,
            type = dataset.type,
            id = dataset.id;
       
    },
    // 视频播放
    videoPlay(e) {
        var dataset = e.currentTarget.dataset;
        if (dataset.type == 'detail') {
            dataset = e.detail;
        }
        var playingVideo;
        if (dataset.type == 'video') {
            playingVideo = dataset.context ? dataset.context : wx.createVideoContext(dataset.id);
        } else if (dataset.type == 'txvideo') {
            playingVideo = Txv.getTxvContext(dataset.id);
        }

        // 播放新视频时停止之前视频的播放
        if (this.playingVideo != undefined && this.playingVideo !== playingVideo) {
            this.playingVideo.pause();
        }

        // 播放视频时保存当前视频的context
        if (this.playingVideo !== playingVideo) {
            setTimeout(() => {
                this.playingVideo = playingVideo;
            }, 100);
        }
    },
    // 视频暂停
    videoPause(e) {
        // 删除当前播放视频context
        if (this.playingVideo != undefined) {
            delete this.playingVideo;
        }
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
    // 分享海报
    sharePoster() {
        this.checkLogin(() => {
            app.Util.network.GET({
                url: app.API('post_qrcode'),
                params: {
                    id: this.data.post.id,
                    w2w_session: app.data.w2w_session
                },
                success: data => {
                    wx.showLoading({
                        title: '正在生成海报',
                        mask: true,
                    });
                    wx.downloadFile({
                        url: data.url,
                        success: qrcodeRes => {
                            console.log('二维码图片本地位置', qrcodeRes.tempFilePath);
                            wx.getImageInfo({
                                src: this.data.post.featured_media.full.url,
                                success: res => {
                                    console.log('产品图片本地位置', res.path);
                                    var resize = app.Util.resizeRect(res.width, res.height, 600, 350);
                                    this.createPosterLocal(res.path, qrcodeRes.tempFilePath, this.data.post, resize);
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
        });
    },
    // 生成分享海报
    createPosterLocal(imageLocal, qrcodeLocal, post, resize) {
        var context = wx.createCanvasContext('poster_canvas');
        context.setFillStyle('#ffffff'); // 填充背景色
        context.fillRect(0, 0, 600, 800);
        context.drawImage(imageLocal, resize.sX, resize.sY, resize.sWidth, resize.sHeight, resize.dX, resize.dY, resize.dWidth, resize.dHeight); // 绘制首图
        context.drawImage(qrcodeLocal, 220, 585, 160, 160); // 绘制二维码
        context.setFillStyle('#000000');
        context.setFontSize(20);
        context.setTextAlign('center');
        context.setGlobalAlpha(0.5);
        context.fillText('长按识别小程序码阅读文章', 300, 780);
        context.setGlobalAlpha(1);
        context.setFillStyle('#000000');
        this.drawPostMeta(context, post); // 文章信息
        context.draw(false, () => {
            wx.canvasToTempFilePath({
                canvasId: 'poster_canvas',
                success: res => {
                    var tempFilePath = res.tempFilePath;
                    wx.hideLoading();
                    console.log('海报图片路径', res.tempFilePath);
                    this.openPosterPopup(res.tempFilePath);
                },
                fail: function(res) {
                    console.log(res);
                }
            });
        });
    },
    // 绘制标题、短描述
    drawPostMeta(context, post) {
        context.setFillStyle('#000000');
        context.setTextAlign('left');

        var lineStartX = 40,
            lineStartY = 410;

        var title = post.title.rendered,
            excerpt = app.Util.stripHTML(post.excerpt.rendered);

        var titleLineHeight = 45,
            excerptLineHeight = 30;

        // 绘制标题
        context.setFontSize(40);
        var titleArr = app.Util.canvasSplitText(context, title, 520);
        if (titleArr.length > 1) {
            context.setFontSize(30);
            titleLineHeight = 40;
            titleArr = app.Util.canvasSplitText(context, title, 520);
        }

        for (var i in titleArr) {
            if (i > 1) {
                break;
            }
            var text = titleArr[i];
            if (i == 1 && titleArr.length > 2) {
                text = text.substr(0, text.length - 1) + '...';
            }
            context.fillText(text, lineStartX, lineStartY);
            lineStartY += titleLineHeight;
        }

        // 绘制短描述
        context.setFontSize(24);
        context.setTextAlign('left');
        context.setGlobalAlpha(0.7);
        lineStartY = lineStartY - titleLineHeight + 50;

        var excerptArr = app.Util.canvasSplitText(context, excerpt, 520);
        for (var i in excerptArr) {
            if (i > 2) {
                break;
            }
            var text = excerptArr[i];
            if (i == 2 && excerptArr.length > 3) {
                text = text.substr(0, text.length - 1) + '...';
            }
            context.fillText(text, lineStartX, lineStartY);
            lineStartY += excerptLineHeight;
        }

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
                    confirmColor: this.data.mainColor,
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
        this.options = options;

        if (options.title) {
            wx.setNavigationBarTitle({
                title: options.title
            })
            this.setPageTitle(options.title);
        }

        app.Util.network.GET({
            url: app.API('post') + options.id,
            success: data => {
                wx.setNavigationBarTitle({
                    title: data.title.rendered
                })
                this.setPageTitle(data.title.rendered);
                this.setData({
                    post: data
                });
            }
        });
    },
    onPageScroll(res) {
        if (res.scrollTop >= this.data.naviShowHeight && this.data.showNaviBar != true) {
            this.setData({
                showNaviBar: true
            });
            wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff'
            })
        } else if (res.scrollTop < this.data.naviShowHeight && this.data.showNaviBar != false) {
            this.setData({
                showNaviBar: false
            });
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#000000'
            })
        }
    },
    onPullDownRefresh() {
        this.onLoad(this.options);
    },
    onShareAppMessage() {
        return app.getShareInfo({
            title: this.data.post.title.rendered,
            path: '/pages/page-detail/page-detail',
            params: {
                id: this.options.id
            },
            imageUrl: this.data.post.featured_media.full.url,
            appReportInviter: true
        });
    }
}))
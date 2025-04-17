// 你可以在这里添加更多的代码来操作宿主网页的window对象

$(document).ready(() => {
	// 动态添加样式
	const style = document.createElement('style');
	style.innerHTML = `
				::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background-color: transparent;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(0, 123, 255, 0.5);
          border-radius: 3px;
        }
				#moveButton {
					position: fixed;
					right: 20px;
					top: 50%;
					width: 50px;
					height: 50px;
					background-color: #007bff;
					color: #fff;
					border-radius: 50%;
					cursor: pointer;
					z-index: 1000;
					user-select: none;
					display: flex;
					justify-content: center;
					align-items: center;
				}
        #content {
          margin-top: 20px;
          flex: 1;
          overflow-y: auto;
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					padding: 10px;
					align-content: flex-start;
        }
        .image {
          cursor: pointer;
          width: 100px;
          height: 100px;
					overflow: hidden;
					border-radius: 10px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					position: relative;
				}
				.image-checkbox {
					position: absolute;
					top: 5px;
					left: 5px;
					z-index: 1;
					cursor: pointer;
				}
				.image img,
				.image video {
					width: 100%;
					height: 100%;
					border-radius: 10px;
					transition: all 0.3s ease-in-out;
				}
				.image img:hover,
				.image video:hover {
					transform: scale(1.1);
				}
        .bottomBtn {
          text-align: right;
          margin-top: 20px;
        }
        #downloadButton {
          padding: 8px 16px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
				#selectButtons {
					margin-top: 20px;
					display: flex;
				}
				#selectAllButton,
				#deselectAllButton {
					padding: 2px 6px;
					border: 1px solid rgba(0, 0, 0, 0.8);
          border-radius: 5px;
          cursor: pointer;
					color: rgba(0, 0, 0, 0.8);
					margin-right: 10px;
					font-size: 12px;
				}
				#selectAllButton:hover,
				#deselectAllButton:hover,
        #downloadButton:hover {
          opacity: 0.8;
        }
				#imageModal {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: rgba(0, 0, 0, 0.8);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 10000;
				}
				#imageModalContent {
					position: relative;
					padding: 20px;
					background-color: #fff;
					border-radius: 10px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
				}
				#imageModalClose {
					position: absolute;
					top: 10px;
					right: 10px;
					font-size: 24px;
					cursor: pointer;
					color: #000;
				}
				#imageModalImg {
					max-width: 100%;
					max-height: 80vh;
				}
				.is-svg {
					width: 200px;
					height: 200px;
				}
				#popup {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					padding: 100px 200px;
					box-sizing: border-box;
					z-index: 9999;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgba(0, 0, 0, 0.5);
				}
				#popupContent {
					position: relative;
					width: 100%;
					height: 100%;
					padding: 20px;
					box-sizing: border-box;
					background-color: #fff;
					border-radius: 10px;
					box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
					display: flex;
					flex-direction: column;
				}
				#popupClose {
					position: absolute;
					top: 10px;
					right: 10px;
					font-size: 24px;
					cursor: pointer;
				}
				#popupTitle {
					margin: 0;
					padding: 0;
					text-align: center;
					font-size: 24px;
				}
				#loadingOverlay {
					position: fixed;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: rgba(0, 0, 0, 0.5);
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 10000;
					color: #fff;
					font-size: 18px;
				}
				#loadingOverlay span {
					background-color: rgba(0, 0, 0, 0.8);
					padding: 10px 20px;
					border-radius: 5px;
				}
      `;
	document.head.appendChild(style);

	// 显示 loading 状态
	const showLoading = () => {
		const $loading = $(`
			<div id="loadingOverlay">
				<span>下载中，请稍候...</span>
			</div>
		`);
		$('body').append($loading);
	};

	// 隐藏 loading 状态
	const hideLoading = () => {
		$('#loadingOverlay').remove();
	};

	// 修改 downloadMedias 函数，将多张媒体文件打包成 ZIP 文件
	const downloadMedias = async () => {
		showLoading(); // 显示 loading 状态
		const zip = new JSZip();
		const selectedMedias = [];
		$('.image-checkbox:checked').each((_, checkbox) => {
			let src = $(checkbox).siblings('img, video').attr('src');
			// 去除扩展名后面的问号内容
			src = src.startsWith('data:') ? src : src.split('?')[0];
			selectedMedias.push(src);
		});

		if (selectedMedias.length > 1) {
			const mediaPromises = selectedMedias.map((src, idx) => {
				if (src.startsWith('data:')) {
					// Base64 格式处理
					const base64Data = src.split(',')[1];
					const mimeType = src.match(/data:(.*?);base64/)[1];
					const fileName = `base64_image_${idx}.${mimeType.split('/')[1]}`;
					zip.file(fileName, base64Data, { base64: true });
				} else {
					// 普通 URL 处理
					return fetch(src)
						.then((response) => response.blob())
						.then((blob) => {
							const n = src.split('/').pop();
							const fileName = src.endsWith('.webp') ? n.replace('.webp', '.jpg') : n;
							zip.file(fileName, blob);
						})
						.catch((error) => console.error(`下载媒体文件失败: ${src}`, error));
				}
			});

			await Promise.all(mediaPromises);

			zip.generateAsync({ type: 'blob' }).then((content) => {
				const a = document.createElement('a');
				a.href = URL.createObjectURL(content);
				a.download = 'Medias.zip';
				a.click();
				hideLoading(); // 隐藏 loading 状态
			});
		} else if (selectedMedias.length === 1) {
			const src = selectedMedias[0];
			if (src.startsWith('data:')) {
				// Base64 格式处理
				const base64Data = src.split(',')[1];
				const mimeType = src.match(/data:(.*?);base64/)[1];
				const fileName = `base64_image.${mimeType.split('/')[1]}`;
				const blob = new Blob([Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))], { type: mimeType });
				const a = document.createElement('a');
				a.href = URL.createObjectURL(blob);
				a.download = fileName;
				a.click();
				hideLoading(); // 隐藏 loading 状态
			} else {
				// 普通 URL 处理
				fetch(src)
					.then((response) => response.blob())
					.then((blob) => {
						const a = document.createElement('a');
						a.href = URL.createObjectURL(blob);
						const n = src.split('/').pop();
						const fileName = src.endsWith('.webp') ? n.replace('.webp', '.jpg') : n;
						a.download = fileName;
						a.click();
						hideLoading(); // 隐藏 loading 状态
					})
					.catch((error) => {
						console.error('下载媒体文件失败:', error);
						hideLoading(); // 隐藏 loading 状态
					});
			}
		} else {
			alert('请选择要下载的媒体文件！');
			hideLoading(); // 隐藏 loading 状态
		}
	};

	// 添加图片点击放大功能
	const openImage = () => {
		$('.image img').on('click', function () {
			const src = $(this).attr('src');
			const isSvg = src.startsWith('data:image/svg') || src.includes('.svg');
			const $imageModal = $(`
                <div id="imageModal">
                  <div id="imageModalContent">
                    <span id="imageModalClose">&times;</span>
                    <img src="${src}" id="imageModalImg" class="${isSvg ? 'is-svg' : ''}" />
                  </div>
                </div>
              `);
			$('body').append($imageModal);

			// 关闭图片模态框
			$('#imageModalClose').on('click', () => {
				$imageModal.remove();
			});
		});
	};

	// 获取所有媒体文件，包括背景图片
	const getAllMedias = () => {
		const Medias = [];
		// 获取所有 <img> 标签的图片
		$('img').each((_, img) => {
			if (img.src) {
				Medias.push(img.src);
			}
		});

		// 获取所有元素的背景图片
		$('*').each((_, el) => {
			const bgImage = $(el).css('background-image');
			if (bgImage && bgImage.startsWith('url(')) {
				const url = bgImage.slice(5, -2); // 去掉 url(" 和 ")
				Medias.push(url);
			}
		});

		// 获取所有 <video> 标签的图片
		$('video').each((_, video) => {
			if (video.src) {
				Medias.push(video.src);
			}
		});

		return [...new Set(Medias)]; // 去重
	};

	// 修改 displayMedias 函数，添加全选和全不选按钮
	const displayMedias = () => {
		const Medias = getAllMedias();
		if (Medias.length) {
			if (!$('#downloadButton').length) {
				$('#popupContent').append(`
					<div class="bottomBtn">
						<button id="downloadButton">下载媒体文件</button>
					</div>
				`);
			}
			$('#downloadButton').off('click').on('click', downloadMedias);

			if (!$('#selectAllButton').length) {
				$('#selectButtons').append(`
					<button id="selectAllButton">全选</button>
					<button id="deselectAllButton">取消</button>
				`);
			}
			$('#selectAllButton')
				.off('click')
				.on('click', () => {
					$('.image-checkbox').prop('checked', true);
				});
			$('#deselectAllButton')
				.off('click')
				.on('click', () => {
					$('.image-checkbox').prop('checked', false);
				});

			const $content = $('#content');
			$content.empty(); // 清空内容

			Medias.forEach((src) => {
				// 判断src是否为 Video
				let mDom = `<img src="${src}" />`;
				if (src.includes('.mp4') || src.includes('.webm') || src.includes('.ogg')) mDom = `<video src="${src}" controls />`;
				const $imgContainer = $(`
					<div class="image">
						<input type="checkbox" class="image-checkbox" />
						${mDom}
					</div>
				`);
				$content.append($imgContainer);
			});

			openImage(); // 添加图片点击放大功能
		}
	};

	// 点击按钮时创建弹出框
	const openDialog = () => {
		const $popup = $(`
        <div id="popup">
          <div id="popupContent">
            <span id="popupClose">&times;</span>
            <h1 id="popupTitle">所有媒体文件</h1>
						<div id="selectButtons"></div>
            <div id="content"></div>
          </div>
        </div>
      `);
		$('body').append($popup);

		// 显示媒体文件
		displayMedias();

		// 关闭弹出框
		$('#popupClose').on('click', () => {
			$popup.remove();
		});
	};

	const createDom = () => {
		// 创建圆形按钮
		const $button = $('<div id="moveButton">下载</div>');
		$('body').append($button);
		$button.hover(
			() => {
				$button.css('opacity', 0.8);
			},
			() => {
				$button.css('opacity', 1);
			}
		);

		// 添加拖动功能
		let isDragging = false;
		let startY, startTop;

		$button.on('mousedown', (e) => {
			isDragging = true;
			startY = e.clientY;
			startTop = parseInt($button.css('top'), 10);
			$('body').on('mousemove', onMouseMove);
			$('body').on('mouseup', onMouseUp);
		});

		const onMouseMove = (e) => {
			if (isDragging) {
				const dy = e.clientY - startY;
				$button.css('top', startTop + dy + 'px');
			}
		};

		const onMouseUp = () => {
			isDragging = false;
			$('body').off('mousemove', onMouseMove);
			$('body').off('mouseup', onMouseUp);
		};

		$button.on('click', openDialog);
	};

	createDom();
});

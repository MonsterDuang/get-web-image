// 你可以在这里添加更多的代码来操作宿主网页的window对象

$(document).ready(() => {
	let tabList = [];
	let activeTab = null;
	let smuId = '';
	let modelId = '';
	let productList = [];

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
				.image img {
					width: 100%;
					height: 100%;
					border-radius: 10px;
					transition: all 0.3s ease-in-out;
				}
				.image img:hover {
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
				.selectButtons {
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
      `;
	document.head.appendChild(style);

	// 修改 downloadImages 函数，确保 .webp 文件下载为 .jpg
	const downloadImages = async () => {
		const selectedImages = [];
		$('.image-checkbox:checked').each((_, checkbox) => {
			let src = $(checkbox).siblings('img').attr('src');
			// 去除扩展名后面的问号内容
			src = src.split('?')[0];
			selectedImages.push(src);
		});

		if (selectedImages.length) {
			selectedImages.forEach((src) => {
				if (src.endsWith('.webp')) {
					// 将 .webp 图片转换为 .jpg
					const img = new Image();
					img.crossOrigin = 'anonymous'; // 允许跨域加载图片
					img.src = src;
					img.onload = () => {
						const canvas = document.createElement('canvas');
						canvas.width = img.width;
						canvas.height = img.height;
						const ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0);
						canvas.toBlob((blob) => {
							const a = document.createElement('a');
							a.href = URL.createObjectURL(blob);
							a.download = src.split('/').pop().replace('.webp', '.jpg'); // 替换扩展名为 .jpg
							a.click();
						}, 'image/jpg');
					};
				} else {
					// 直接下载其他非 .webp 图片
					fetch(src)
						.then((response) => response.blob())
						.then((blob) => {
							const a = document.createElement('a');
							a.href = URL.createObjectURL(blob);
							a.download = src.split('/').pop(); // 使用图片文件名
							a.click();
						})
						.catch((error) => console.error('下载图片失败:', error));
				}
			});
		} else {
			alert('请选择要下载的图片！');
		}
	};

	// 添加图片点击放大功能
	const openImage = () => {
		$('.image img').on('click', function () {
			const src = $(this).attr('src');
			const isSvg = src.startsWith('data:image/svg');
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

	// 获取所有图片，包括背景图片
	const getAllImages = () => {
		const images = [];
		// 获取所有 <img> 标签的图片
		$('img').each((_, img) => {
			if (img.src) {
				images.push(img.src);
			}
		});

		// 获取所有元素的背景图片
		$('*').each((_, el) => {
			const bgImage = $(el).css('background-image');
			if (bgImage && bgImage.startsWith('url(')) {
				const url = bgImage.slice(5, -2); // 去掉 url(" 和 ")
				images.push(url);
			}
		});

		return [...new Set(images)]; // 去重
	};

	// 修改 displayImages 函数，添加全选和全不选按钮
	const displayImages = () => {
		const images = getAllImages();
		if (images.length) {
			if (!$('#downloadButton').length) {
				$('#popupContent').append(`
					<div class="bottomBtn">
						<button id="downloadButton">下载图片</button>
					</div>
				`);
			}

			$('#downloadButton').off('click').on('click', downloadImages);
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

			images.forEach((src) => {
				const $imgContainer = $(`
					<div class="image">
						<input type="checkbox" class="image-checkbox" />
						<img src="${src}" />
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
            <h1 id="popupTitle">所有图片</h1>
						<div class="selectButtons">
							<button id="selectAllButton">全选</button>
							<button id="deselectAllButton">全不选</button>
						</div>
            <div id="content"></div>
          </div>
        </div>
      `);
		$('body').append($popup);

		// 显示图片
		displayImages();

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

class SVGSplitter {
    constructor() {
        this.svgContent = null;
        this.originalSVG = null;
        this.splitResult = null;
        this.annotationsVisible = true; // 标注显示状态
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 文件上传
        const fileUpload = document.getElementById('file-upload');
        const fileInput = document.getElementById('svg-file');

        console.log('File upload elements:', fileUpload, fileInput);

        fileUpload.addEventListener('click', () => {
            console.log('File upload clicked');
            // 如果已经上传了文件，仍然允许重新选择
            fileInput.click();
        });
        fileInput.addEventListener('change', (e) => {
            console.log('File input change event:', e);
            this.handleFileUpload(e);
        });

        // 拖拽上传
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'image/svg+xml') {
                this.loadSVG(files[0]);
            }
        });

        // 分割点同步
        document.addEventListener('input', (e) => {
            if (e.target.type === 'range' && e.target.closest('.break-point')) {
                const breakPoint = e.target.closest('.break-point');
                const numberInput = breakPoint.querySelector('input[type="number"]');
                numberInput.value = e.target.value;
                this.updateColorControls();
            } else if (e.target.type === 'number' && e.target.closest('.break-point')) {
                const breakPoint = e.target.closest('.break-point');
                const rangeInput = breakPoint.querySelector('input[type="range"]');
                rangeInput.value = e.target.value;
                this.updateColorControls();
            }
        });

        // 标签大小控制
        const labelSize = document.getElementById('label-size');
        const labelSizeValue = document.getElementById('label-size-value');
        if (labelSize && labelSizeValue) {
            labelSize.addEventListener('input', (e) => {
                labelSizeValue.textContent = e.target.value + 'px';
            });
        }

        // 文字距离控制
        const textDistance = document.getElementById('text-distance');
        const textDistanceValue = document.getElementById('text-distance-value');
        if (textDistance && textDistanceValue) {
            textDistance.addEventListener('input', (e) => {
                textDistanceValue.textContent = e.target.value + '%';
            });
        }

        // 垂直缩放控制
        const verticalScale = document.getElementById('vertical-scale');
        const verticalScaleValue = document.getElementById('vertical-scale-value');
        if (verticalScale && verticalScaleValue) {
            verticalScale.addEventListener('input', (e) => {
                verticalScaleValue.textContent = e.target.value + '%';
            });
        }
    }

    handleFileUpload(event) {
        console.log('handleFileUpload called', event);
        const file = event.target.files[0];
        console.log('Selected file:', file);
        if (file && file.type === 'image/svg+xml') {
            this.loadSVG(file);
        } else {
            this.showToast('请选择有效的SVG文件', 'error');
        }
    }

    async loadSVG(file) {
        try {
            const text = await file.text();
            this.svgContent = text;
            this.originalSVG = text;
            
            // 更新文件上传框状态
            const fileUpload = document.getElementById('file-upload');
            fileUpload.classList.add('uploaded');
            
            // 更新文件上传框显示内容
            const fileUploadIcon = fileUpload.querySelector('.file-upload-icon');
            const fileUploadText = fileUpload.querySelector('p:first-of-type');
            const fileUploadSubtext = fileUpload.querySelector('p:last-of-type');
            
            fileUploadIcon.textContent = '✅';
            fileUploadText.innerHTML = `<strong>${file.name}</strong> 已上传`;
            fileUploadSubtext.textContent = '点击重新上传其他文件';
            
            this.showToast('SVG文件上传成功！', 'success');
            
            // 重置分割点
            this.resetBreakPoints();
        } catch (error) {
            this.showToast('文件读取失败', 'error');
            console.error('File reading error:', error);
        }
    }

    resetBreakPoints() {
        const splitControls = document.getElementById('split-controls');
        splitControls.innerHTML = `
            <div class="split-item">
                <div class="break-point">
                    <input type="range" min="10" max="90" value="30" step="1">
                    <input type="number" min="10" max="90" value="30" step="1">%
                    <button onclick="removeBreakPoint(this)">删除</button>
                </div>
                <div class="color-item">
                    <input type="text" placeholder="标签名称" value="第1部分">
                    <input type="color" value="#FF6B6B" title="填充色">
                    <input type="color" value="#C92A2A" title="描边色">
                </div>
            </div>
            <div class="split-item">
                <div class="break-point">
                    <input type="range" min="10" max="90" value="70" step="1">
                    <input type="number" min="10" max="90" value="70" step="1">%
                    <button onclick="removeBreakPoint(this)">删除</button>
                </div>
                <div class="color-item">
                    <input type="text" placeholder="标签名称" value="第2部分">
                    <input type="color" value="#4ECDC4" title="填充色">
                    <input type="color" value="#087F5B" title="描边色">
                </div>
            </div>
        `;
    }

    updateColorControls() {
        // 新布局中颜色控制已经集成在split-item中，不需要单独更新
        // 这个函数保留以兼容性，但实际不需要操作
    }

    createColorItem(index) {
        const div = document.createElement('div');
        div.className = 'color-item';
        div.innerHTML = `
            <input type="text" placeholder="标签名称" value="第${index}部分">
            <input type="color" value="${this.getDefaultColor(index - 1).fill}" title="填充色">
            <input type="color" value="${this.getDefaultColor(index - 1).stroke}" title="描边色">
        `;
        return div;
    }

    getDefaultColor(index) {
        const colors = [
            { fill: '#FF6B6B', stroke: '#C92A2A' },
            { fill: '#4ECDC4', stroke: '#087F5B' },
            { fill: '#FFD93D', stroke: '#F08C00' },
            { fill: '#A78BFA', stroke: '#7C3AED' },
            { fill: '#34D399', stroke: '#059669' },
            { fill: '#60A5FA', stroke: '#2563EB' },
            { fill: '#F472B6', stroke: '#DB2777' },
            { fill: '#FB923C', stroke: '#EA580C' }
        ];
        return colors[index % colors.length];
    }



    getColors() {
        const colors = [];
        const splitItems = document.querySelectorAll('.split-item');
        splitItems.forEach(item => {
            const colorItem = item.querySelector('.color-item');
            if (colorItem) {
                const colorInputs = colorItem.querySelectorAll('input[type="color"]');
                if (colorInputs.length >= 2) {
                    const fill = colorInputs[0].value;
                    const stroke = colorInputs[1].value;
                    colors.push({ fill, stroke });
                }
            }
        });
        return colors;
    }

    getLabels() {
        const labels = [];
        const splitItems = document.querySelectorAll('.split-item');
        splitItems.forEach(item => {
            const colorItem = item.querySelector('.color-item');
            if (colorItem) {
                const textInput = colorItem.querySelector('input[type="text"]');
                if (textInput) {
                    const label = textInput.value || '未命名';
                    labels.push(label);
                }
            }
        });
        return labels;
    }

    getLabelSize() {
        const labelSizeInput = document.getElementById('label-size');
        if (!labelSizeInput) return 20; // 默认值
        const value = parseInt(labelSizeInput.value);
        const valueDisplay = document.getElementById('label-size-value');
        if (valueDisplay) valueDisplay.textContent = value + 'px';
        return value;
    }

    getTextDistance() {
        const textDistanceInput = document.getElementById('text-distance');
        if (!textDistanceInput) return 3; // 默认值
        const value = parseFloat(textDistanceInput.value);
        const valueDisplay = document.getElementById('text-distance-value');
        if (valueDisplay) valueDisplay.textContent = value + '%';
        return value;
    }

    getVerticalScale() {
        const verticalScaleInput = document.getElementById('vertical-scale');
        if (!verticalScaleInput) return 1; // 默认值
        const value = parseFloat(verticalScaleInput.value);
        const valueDisplay = document.getElementById('vertical-scale-value');
        if (valueDisplay) valueDisplay.textContent = value + '%';
        return value / 100; // 返回小数形式
    }

    async generatePreview() {
        if (!this.svgContent) {
            this.showToast('请先上传SVG文件', 'error');
            return;
        }

        try {
            this.showToast('正在生成预览...', 'info');
            
            const splitItems = document.querySelectorAll('.split-item');
            const colors = this.getColors();
            const labels = this.getLabels();
            const labelSize = this.getLabelSize();
            const textDistance = this.getTextDistance();
            const verticalScale = this.getVerticalScale();

            // 验证数据有效性
            if (splitItems.length === 0) {
                this.showToast('请至少设置一个分割部分', 'error');
                return;
            }

            console.log('生成预览 - 分割项数量:', splitItems.length);
            console.log('生成预览 - 颜色数量:', colors.length);
            console.log('生成预览 - 标签数量:', labels.length);

            // 确保颜色和标签数量匹配
            while (colors.length < splitItems.length) {
                colors.push(this.getDefaultColor(colors.length));
            }
            while (labels.length < splitItems.length) {
                labels.push(`第${labels.length + 1}部分`);
            }

            // 解析SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(this.svgContent, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;

            // 获取SVG尺寸
            const viewBox = svgElement.getAttribute('viewBox');
            let width, height, x = 0, y = 0;
            
            if (viewBox) {
                const values = viewBox.split(' ').map(Number);
                x = values[0];
                y = values[1];
                width = values[2];
                height = values[3];
            } else {
                width = parseFloat(svgElement.getAttribute('width') || '800');
                height = parseFloat(svgElement.getAttribute('height') || '600');
            }

            // 创建分割后的SVG
            const gap = 20;
            const parts = this.calculateParts(width, splitItems, gap);
            
            // 计算实际的总宽度（最后一个部分的右边界位置）
            const lastPart = parts[parts.length - 1];
            const actualTotalWidth = lastPart.x + lastPart.width;

            const newSVG = this.createSplitSVG(
                svgElement, actualTotalWidth, height, parts, colors, labels, labelSize, textDistance, gap, width, verticalScale
            );

            // 显示预览
            const previewContainer = document.getElementById('preview-container');
            // 彻底清理预览容器
            while (previewContainer.firstChild) {
                previewContainer.removeChild(previewContainer.firstChild);
            }
            
            // 创建包装容器以确保SVG正确显示
            const wrapper = document.createElement('div');
            wrapper.style.width = '100%';
            wrapper.style.height = '100%';
            wrapper.style.overflow = 'auto';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';
            wrapper.appendChild(newSVG);
            previewContainer.appendChild(wrapper);

            // 保存分割结果
            this.splitResult = {
                svg: newSVG.outerHTML,
                width: actualTotalWidth,
                height: height * verticalScale
            };

            // 启用导出按钮
            document.getElementById('export-png').disabled = false;
            document.getElementById('export-jpg').disabled = false;

            this.showToast('预览生成成功！', 'success');
        } catch (error) {
            this.showToast('预览生成失败', 'error');
            console.error('Preview generation error:', error);
        }
    }

    calculateParts(originalWidth, splitItems, gap) {
        const parts = [];
        const leftMargin = gap; // 左边距，与间隔相同
        let currentX = leftMargin;

        // 为每个分割项创建部分
        splitItems.forEach((item, index) => {
            const rangeInput = item.querySelector('.break-point input[type="range"]');
            const percentage = parseInt(rangeInput.value);
            // 按实际百分比分配原始宽度
            const partWidth = (originalWidth * percentage) / 100;
            
            parts.push({
                x: currentX,
                width: partWidth,
                percentage: percentage.toFixed(0)
            });

            currentX += partWidth + gap;
        });

        return parts;
    }

    createSplitSVG(originalSVG, totalWidth, height, parts, colors, labels, labelSize, textDistance, gap, originalWidth, verticalScale) {
        const scaledHeight = height * verticalScale;
        const newSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        newSVG.setAttribute('width', totalWidth);
        newSVG.setAttribute('height', scaledHeight);
        newSVG.setAttribute('viewBox', `0 0 ${totalWidth} ${scaledHeight}`);
        newSVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // 添加背景
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', totalWidth);
        background.setAttribute('height', scaledHeight);
        background.setAttribute('fill', '#f8f9fa');
        background.setAttribute('stroke', '#dee2e6');
        background.setAttribute('stroke-width', '1');
        newSVG.appendChild(background);

        // 添加defs和裁剪路径
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        newSVG.appendChild(defs);

        // 获取原始图形元素
        const graphicElements = [];
        for (let child of originalSVG.children) {
            const tagName = child.tagName.toLowerCase();
            if (['g', 'path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'].includes(tagName)) {
                graphicElements.push(child);
            }
        }

        // 生成唯一的会话ID避免ID冲突
        const sessionId = Math.random().toString(36).substr(2, 9);
        
        // 为每个部分创建裁剪和组
        parts.forEach((part, index) => {
            // 创建裁剪路径，使用唯一ID避免冲突
            const uniqueId = `clip-part${sessionId}-${index + 1}`;
            const groupId = `part${sessionId}-${index + 1}`;
            
            const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPath.setAttribute('id', uniqueId);
            
            const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            clipRect.setAttribute('x', part.x);
            clipRect.setAttribute('y', '0');
            clipRect.setAttribute('width', part.width);
            clipRect.setAttribute('height', scaledHeight);
            
            clipPath.appendChild(clipRect);
            defs.appendChild(clipPath);

            // 创建组
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('id', groupId);
            group.setAttribute('clip-path', `url(#${uniqueId})`);
            
            // 复制原始元素并应用变换
            graphicElements.forEach(element => {
                const clone = element.cloneNode(true);
                
                // 计算这个部分在原始SVG中应该显示的内容的起始位置
                // 每个部分按百分比显示原始SVG的对应片段
                let originalStartX = 0;
                for (let i = 0; i < index; i++) {
                    originalStartX += (parseFloat(parts[i].percentage) / 100) * originalWidth;
                }
                
                // 偏移量：将原始SVG内容向左移动，使得正确的内容显示在裁剪区域中
                // 裁剪区域在 part.x 位置，宽度为 part.width
                // 我们需要让原始SVG中从 originalStartX 开始的内容显示在这个区域中
                const offset = part.x - originalStartX;
                
                // 应用水平和垂直缩放变换
                let transform = `translate(${offset}, 0)`;
                if (verticalScale !== 1) {
                    transform += ` scale(1, ${verticalScale})`;
                }
                
                // 如果有现有变换，保留它
                const existingTransform = clone.getAttribute('transform') || '';
                if (existingTransform) {
                    transform += ` ${existingTransform}`;
                }
                
                clone.setAttribute('transform', transform);

                // 应用颜色
                this.applyColors(clone, colors[index]);
                
                group.appendChild(clone);
            });

            newSVG.appendChild(group);

            // 添加边框和标注
            this.addAnnotations(newSVG, part, index, labels[index], part.percentage, labelSize, textDistance, totalWidth, scaledHeight, verticalScale);
        });

        return newSVG;
    }

    applyTransform(element, offsetX) {
        const transform = element.getAttribute('transform') || '';
        const newTransform = `translate(${offsetX}, 0) ${transform}`;
        element.setAttribute('transform', newTransform);
    }

    applyColors(element, color) {
        const applyToElement = (el) => {
            const tagName = el.tagName.toLowerCase();
            if (['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'].includes(tagName)) {
                // 移除style属性
                el.removeAttribute('style');
                el.setAttribute('fill', color.fill);
                el.setAttribute('stroke', color.stroke);
                el.setAttribute('stroke-width', '2');
                el.setAttribute('stroke-opacity', '1');
                el.setAttribute('fill-opacity', '0.9');
            }

            // 递归处理子元素
            for (let child of el.children) {
                applyToElement(child);
            }
        };

        applyToElement(element);
    }

    addAnnotations(svg, part, index, label, percentage, labelSize, textDistance, totalWidth, height, verticalScale = 1) {
        // 将百分比转换为像素距离
        const distancePixels = (textDistance / 100) * height;
        // 修复方括号长度问题：使用固定的偏移值，而不是基于distancePixels的比例值
        const bracketOffset = 15; // 固定值，不随文字距离变化
        const lineOffset = 20; // 固定值，确保方括号长度一致

        // 边框组
        const borderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        borderGroup.setAttribute('id', `border-part${index + 1}`);
        borderGroup.setAttribute('class', 'annotation-border'); // 添加类名用于切换显示

        // 上边框线
        const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        topLine.setAttribute('d', `M ${part.x + lineOffset},${distancePixels} L ${part.x + part.width - lineOffset},${distancePixels}`);
        topLine.setAttribute('stroke', '#333333');
        topLine.setAttribute('stroke-width', '2');
        topLine.setAttribute('fill', 'none');
        borderGroup.appendChild(topLine);

        // 左边方形括号
        const leftBracket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftBracket.setAttribute('d', `M ${part.x + lineOffset},${distancePixels} L ${part.x + bracketOffset},${distancePixels} L ${part.x + bracketOffset},${distancePixels + 10}`);
        leftBracket.setAttribute('stroke', '#333333');
        leftBracket.setAttribute('stroke-width', '2');
        leftBracket.setAttribute('fill', 'none');
        borderGroup.appendChild(leftBracket);

        // 右边方形括号
        const rightBracket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightBracket.setAttribute('d', `M ${part.x + part.width - lineOffset},${distancePixels} L ${part.x + part.width - bracketOffset},${distancePixels} L ${part.x + part.width - bracketOffset},${distancePixels + 10}`);
        rightBracket.setAttribute('stroke', '#333333');
        rightBracket.setAttribute('stroke-width', '2');
        rightBracket.setAttribute('fill', 'none');
        borderGroup.appendChild(rightBracket);

        // 下边框线
        const bottomLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bottomLine.setAttribute('d', `M ${part.x + lineOffset},${height - distancePixels} L ${part.x + part.width - lineOffset},${height - distancePixels}`);
        bottomLine.setAttribute('stroke', '#333333');
        bottomLine.setAttribute('stroke-width', '2');
        bottomLine.setAttribute('fill', 'none');
        borderGroup.appendChild(bottomLine);

        // 左下方形括号
        const leftBottomBracket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        leftBottomBracket.setAttribute('d', `M ${part.x + lineOffset},${height - distancePixels} L ${part.x + bracketOffset},${height - distancePixels} L ${part.x + bracketOffset},${height - distancePixels - 10}`);
        leftBottomBracket.setAttribute('stroke', '#333333');
        leftBottomBracket.setAttribute('stroke-width', '2');
        leftBottomBracket.setAttribute('fill', 'none');
        borderGroup.appendChild(leftBottomBracket);

        // 右下方形括号
        const rightBottomBracket = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        rightBottomBracket.setAttribute('d', `M ${part.x + part.width - lineOffset},${height - distancePixels} L ${part.x + part.width - bracketOffset},${height - distancePixels} L ${part.x + part.width - bracketOffset},${height - distancePixels - 10}`);
        rightBottomBracket.setAttribute('stroke', '#333333');
        rightBottomBracket.setAttribute('stroke-width', '2');
        rightBottomBracket.setAttribute('fill', 'none');
        borderGroup.appendChild(rightBottomBracket);

        svg.appendChild(borderGroup);

        // 文本组
        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textGroup.setAttribute('id', `text-part${index + 1}`);
        textGroup.setAttribute('class', 'annotation-text'); // 添加类名用于切换显示

        // 检测是否包含中文
        const containsChinese = /[\u4e00-\u9fff]/.test(label);
        const fontFamily = containsChinese ? 
            "'Microsoft YaHei', 'SimHei', 'SimSun', 'FangSong', 'KaiTi', 'Arial Unicode MS', sans-serif" : 
            "Arial, Helvetica, sans-serif";

        // 上方百分比标注
        const topText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        topText.setAttribute('x', part.x + part.width / 2);
        topText.setAttribute('y', distancePixels + labelSize + 2);
        topText.setAttribute('text-anchor', 'middle');
        topText.setAttribute('font-family', fontFamily);
        topText.setAttribute('font-size', labelSize);
        topText.setAttribute('font-weight', 'bold');
        topText.setAttribute('fill', '#333333');
        topText.textContent = percentage + '%';
        textGroup.appendChild(topText);

        // 下方标签
        const bottomText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bottomText.setAttribute('x', part.x + part.width / 2);
        bottomText.setAttribute('y', height - distancePixels - 2);
        bottomText.setAttribute('text-anchor', 'middle');
        bottomText.setAttribute('font-family', fontFamily);
        bottomText.setAttribute('font-size', labelSize);
        bottomText.setAttribute('font-weight', 'bold');
        bottomText.setAttribute('fill', '#333333');
        bottomText.textContent = label;
        textGroup.appendChild(bottomText);

        svg.appendChild(textGroup);
    }

    async exportImage(format) {
        if (!this.splitResult) {
            this.showToast('请先生成预览', 'error');
            return;
        }

        try {
            this.showToast(`正在导出${format.toUpperCase()}图片...`, 'info');

            // 创建canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = this.splitResult.width * 2; // 高清输出
            canvas.height = this.splitResult.height * 2;
            ctx.scale(2, 2);
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, this.splitResult.width, this.splitResult.height);

            // 检查canvg是否可用
            if (typeof canvg !== 'undefined') {
                // 使用canvg渲染SVG到canvas
                const v = await canvg.fromString(ctx, this.splitResult.svg);
                await v.render();
            } else {
                // 备用方案：创建图像并绘制
                const img = new Image();
                const svgBlob = new Blob([this.splitResult.svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });
                
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(url);
            }

            // 转换为指定格式
            const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
            const quality = format === 'jpg' ? 0.9 : undefined;
            
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `svg-split-result.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showToast(`${format.toUpperCase()}图片导出成功！`, 'success');
            }, mimeType, quality);

        } catch (error) {
            this.showToast('图片导出失败，正在尝试SVG下载...', 'error');
            console.error('Export error:', error);
            
            // 备用方案：直接下载SVG文件
            try {
                const svgBlob = new Blob([this.splitResult.svg], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `svg-split-result.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('SVG文件导出成功！', 'success');
            } catch (svgError) {
                this.showToast('导出失败，请重试', 'error');
                console.error('SVG export error:', svgError);
            }
        }
    }

    toggleAnnotations() {
        this.annotationsVisible = !this.annotationsVisible;
        
        // 更新按钮状态
        const toggleBtn = document.getElementById('toggle-annotations');
        if (toggleBtn) {
            if (this.annotationsVisible) {
                toggleBtn.textContent = '👁️ 隐藏';
                toggleBtn.classList.remove('hidden');
            } else {
                toggleBtn.textContent = '👁️‍🗨️ 显示';
                toggleBtn.classList.add('hidden');
            }
        }
        
        // 切换标注显示
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            const svg = previewContainer.querySelector('svg');
            if (svg) {
                // 切换边框显示
                const borderElements = svg.querySelectorAll('.annotation-border');
                borderElements.forEach(el => {
                    el.style.display = this.annotationsVisible ? 'block' : 'none';
                });
                
                // 切换文本显示
                const textElements = svg.querySelectorAll('.annotation-text');
                textElements.forEach(el => {
                    el.style.display = this.annotationsVisible ? 'block' : 'none';
                });
            }
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// 初始化
let svgSplitter;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    svgSplitter = new SVGSplitter();
    
    // 将全局函数绑定到window对象
    window.addBreakPoint = function() {
        const splitControls = document.getElementById('split-controls');
        const currentCount = splitControls.querySelectorAll('.split-item').length;
        
        if (currentCount >= 8) {
            svgSplitter.showToast('最多支持8个分割点', 'error');
            return;
        }

        const newIndex = currentCount + 1;
        const defaultValue = Math.min(50 + currentCount * 5, 80);
        const color = svgSplitter.getDefaultColor(newIndex - 1);

        const newSplitItem = document.createElement('div');
        newSplitItem.className = 'split-item';
        newSplitItem.innerHTML = `
            <div class="break-point">
                <input type="range" min="10" max="90" value="${defaultValue}" step="1">
                <input type="number" min="10" max="90" value="${defaultValue}" step="1">%
                <button onclick="removeBreakPoint(this)">删除</button>
            </div>
            <div class="color-item">
                <input type="text" placeholder="标签名称" value="第${newIndex}部分">
                <input type="color" value="${color.fill}" title="填充色">
                <input type="color" value="${color.stroke}" title="描边色">
            </div>
        `;
        
        splitControls.appendChild(newSplitItem);
    };

    window.removeBreakPoint = function(button) {
        const splitItem = button.closest('.split-item');
        const splitControls = document.getElementById('split-controls');
        
        if (splitControls.querySelectorAll('.split-item').length <= 1) {
            svgSplitter.showToast('至少需要保留一个分割点', 'error');
            return;
        }
        
        splitItem.remove();
    };

    window.generatePreview = function() {
        svgSplitter.generatePreview();
    };

    window.exportImage = function(format) {
        svgSplitter.exportImage(format);
    };

    window.toggleAnnotations = function() {
        svgSplitter.toggleAnnotations();
    };
});
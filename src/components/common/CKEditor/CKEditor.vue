<template>
	<div>
		<div class="main-container">
			<div class="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar"
				ref="editorContainerElement">
				<div class="editor-container__editor">
					<div ref="editorElement">
						<ckeditor v-if="isLayoutReady" :model-value="modelValue" @update:model-value="updateContent"
							:editor="editor" :config="editorConfig" @ready="onEditorReady" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {
	ClassicEditor,
	AccessibilityHelp,
	Alignment,
	Autoformat,
	AutoImage,
	AutoLink,
	Autosave,
	BalloonToolbar,
	BlockQuote,
	BlockToolbar,
	Bold,
	Code,
	CodeBlock,
	Essentials,
	FindAndReplace,
	FontBackgroundColor,
	FontColor,
	FontFamily,
	FontSize,
	FullPage,
	GeneralHtmlSupport,
	Heading,
	Highlight,
	HorizontalLine,
	HtmlEmbed,
	ImageBlock,
	ImageCaption,
	ImageInline,
	ImageInsert,
	ImageInsertViaUrl,
	ImageResize,
	ImageStyle,
	ImageTextAlternative,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	Markdown,
	MediaEmbed,
	Mention,
	PageBreak,
	Paragraph,
	PasteFromOffice,
	RemoveFormat,
	SelectAll,
	SimpleUploadAdapter,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersMathematical,
	SpecialCharactersText,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	TodoList,
	Underline,
	Undo
} from 'ckeditor5';

import translations from 'ckeditor5/translations/ko.js';
import 'ckeditor5/ckeditor5.css';
import { $api } from "@/services/api/api";

class CustomUploadAdapter {
	constructor(loader) {
		this.loader = loader;
	}

	upload() {
		return this.loader.file
			.then(file => {
				return this.resizeImage(file, 500, 500)
					.then(resizedFile => {
						return $api.file.post({}, '', resizedFile)
							.then(response => {
								const imageUrl = response.msg;
								return {
									default: imageUrl,
									fileName: resizedFile.name
								};
							});
					});
			});
	}

	resizeImage(file, maxWidth, maxHeight) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = event => {
				const img = new Image();
				img.src = event.target.result;
				img.onload = () => {
					const canvas = document.createElement('canvas');
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > maxWidth) {
							height *= maxWidth / width;
							width = maxWidth;
						}
					} else {
						if (height > maxHeight) {
							width *= maxHeight / height;
							height = maxHeight;
						}
					}

					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, width, height);

					canvas.toBlob(blob => {
						const resizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: Date.now()
						});
						resolve(resizedFile);
					}, file.type);
				};
				img.onerror = reject;
			};
			reader.onerror = reject;
		});
	}
}

function uploadPlugin(editor) {
	editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
		const adapter = new CustomUploadAdapter(loader);

		// 이미지 업로드 후 파일 이름을 HTML에 추가하는 로직
		loader.on('change', () => {
			loader.file.then(file => {
				// 파일 이름을 data-filename 속성으로 추가
				editor.model.change(writer => {
					const imageElement = editor.model.document.selection.getSelectedElement();
					if (imageElement) {
						writer.setAttribute('data-filename', file.name, imageElement);
					}
				});
			});
		});

		return adapter;
	};
}

export default {
	name: 'CKEditorComponent', // 컴포넌트 이름 설정
	props: {
		modelValue: {
			type: String,
			default: ''
		},
		initialHtml: {
			type: String,
			default: ''
		}
	},
	emits: ['update:model-value'],
	data() {
		return {
			editor: ClassicEditor,
			isLayoutReady: false, // CKEditor 렌더링 준비 상태
			content: this.initialHtml, // CKEditor의 초기값
			editorInstance: null,
			editorConfig: {
				toolbar: {
					items: [
						'undo',
						'redo',
						'|',
						'findAndReplace',
						'|',
						'heading',
						'|',
						'fontSize',
						'fontFamily',
						'fontColor',
						'fontBackgroundColor',
						'|',
						'bold',
						'italic',
						'underline',
						'strikethrough',
						'subscript',
						'superscript',
						'code',
						'removeFormat',
						'|',
						'specialCharacters',
						'horizontalLine',
						'pageBreak',
						'link',
						'insertImage',
						'mediaEmbed',
						'insertTable',
						'highlight',
						'blockQuote',
						'codeBlock',
						'htmlEmbed',
						'|',
						'alignment',
						'|',
						'bulletedList',
						'numberedList',
						'todoList',
						'outdent',
						'indent',
						'insertImage'
					],
					shouldNotGroupWhenFull: true // 툴바의 그룹화 비활성화
				},
				plugins: [
					AccessibilityHelp,
					Alignment,
					Autoformat,
					AutoImage,
					AutoLink,
					Autosave,
					BalloonToolbar,
					BlockQuote,
					BlockToolbar,
					Bold,
					Code,
					CodeBlock,
					Essentials,
					FindAndReplace,
					FontBackgroundColor,
					FontColor,
					FontFamily,
					FontSize,
					FullPage,
					GeneralHtmlSupport,
					Heading,
					Highlight,
					HorizontalLine,
					HtmlEmbed,
					ImageBlock,
					ImageCaption,
					ImageInline,
					ImageInsert,
					ImageInsertViaUrl,
					ImageResize,
					ImageStyle,
					ImageTextAlternative,
					ImageToolbar,
					ImageUpload,
					Indent,
					IndentBlock,
					Italic,
					Link,
					LinkImage,
					List,
					ListProperties,
					Markdown,
					MediaEmbed,
					Mention,
					PageBreak,
					Paragraph,
					PasteFromOffice,
					RemoveFormat,
					SelectAll,
					SimpleUploadAdapter,
					SpecialCharacters,
					SpecialCharactersArrows,
					SpecialCharactersCurrency,
					SpecialCharactersEssentials,
					SpecialCharactersLatin,
					SpecialCharactersMathematical,
					SpecialCharactersText,
					Strikethrough,
					Subscript,
					Superscript,
					Table,
					TableCaption,
					TableCellProperties,
					TableColumnResize,
					TableProperties,
					TableToolbar,
					TextTransformation,
					TodoList,
					Underline,
					Undo
				],
				extraPlugins: [uploadPlugin],
				simpleUpload: {
					uploadUrl: '' // 파일 업로드 경로
				},
				image: {
					toolbar: [
						'toggleImageCaption',
						'imageTextAlternative',
						'|',
						'imageStyle:inline',
						'imageStyle:wrapText',
						'imageStyle:breakText',
						'|',
						'resizeImage'
					]
				},
				htmlSupport: {
					allow: [
						{
							name: /^.*$/,
							styles: true, // 인라인 스타일 허용
							attributes: true, // 모든 속성 허용
							classes: true // 모든 클래스 허용
						},
						{
							name: 'img',
							attributes: {
								'data-filename': true  // data-filename 속성 허용
							}
						}
					],
					disallow: []
				},
				fullPage: true,
				language: 'ko',
				stickyToolbar: true,
				initialData: this.initialHtml, // 초기 HTML 설정
				placeholder: '내용을 입력하세요...', // 입력란의 기본 안내 텍스트
				removePlugins: ['Table'],
				extraAllowedContent: '*(*);*{*}',
				fullPage: true,
				allowedContent: true
			}
		};
	},
	watch: {
		modelValue(newValue) {
			// 에디터 인스턴스가 존재하고, 현재 에디터의 데이터가 새로운 값과 다른 경우에만 업데이트
			if (this.editorInstance && this.editorInstance.getData() !== newValue) {
				this.editorInstance.setData(newValue);
			}
		}
	},
	mounted() {
		this.isLayoutReady = true;
		if (this.initialHtml && !this.modelValue) {
			this.$emit('update:model-value', this.initialHtml);
		}
	},
	methods: {
		onEditorReady(editor) {
			this.editorInstance = editor;
			if (this.initialHtml && !this.modelValue) {
				editor.setData(this.initialHtml);
			}
		},
		updateContent(content) {
			this.$emit('update:model-value', content);
		}
	}
};
</script>

<style scoped>
.main-container {
	max-width: 99%;
	margin: 0 auto;
	padding: 20px;
	border-radius: 8px;
}

.editor-container {
	background-color: #ffffff;
	border-radius: 8px;
	padding: 16px;
}

::v-deep .ck-editor__editable {
	min-height: 400px;
	padding: 16px;
	font-size: 16px;
	line-height: 1.6;
	color: #333;
	background-color: #fff;
	border-radius: 4px;
}

::v-deep .ck-toolbar {
	border-bottom: 1px solid #e0e0e0;
	background-color: #f7f7f7;
	border-radius: 8px 8px 0 0;
}

::v-deep .ck-content pre.fancy-code-dark {
	background-color: #282c34;
	color: #61dafb;
	padding: 16px;
	border-radius: 4px;
}

::v-deep .ck-editor__top {
	position: sticky;
	top: 0;
	z-index: 10;
	/* 툴바가 다른 콘텐츠 위로 올라오도록 설정 */
	background-color: #fff;
	/* 툴바 배경색 설정 */
	border-bottom: 1px solid #e0e0e0;
	/* 툴바 하단 경계선 */
}
</style>

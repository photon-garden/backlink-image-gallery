import { Plugin, TAbstractFile } from "obsidian";

export default class BacklinkImageGalleryPlugin extends Plugin {
	async onload() {
		this.registerMarkdownCodeBlockProcessor(
			"backlink-image-gallery",
			(source, el, ctx) => {
				const file = this.app.vault.getAbstractFileByPath(
					ctx.sourcePath
				);

				const backlinkingFiles = getBacklinkingFiles(file);

				const embedLinksFromBacklinkingFiles = backlinkingFiles
					.flatMap((file) => {
						const cache = this.app.metadataCache.getFileCache(file);
						if (cache == null) {
							return null;
						}

						return cache.embeds;
					})
					.filter((embed) => embed != null);

				const filesEmbeddedInBacklinkingFiles: TAbstractFile[] =
					embedLinksFromBacklinkingFiles
						.map((embedLink) => {
							return this.app.vault.getAbstractFileByPath(
								embedLink.link
							);
						})
						.filter((file) => file != null);

				const imagesEmbeddedInBacklinkingFiles =
					filesEmbeddedInBacklinkingFiles.filter(
						(file) =>
							file.extension === "png" ||
							file.extension === "jpg" ||
							file.extension === "jpeg"
					) as TFile[];

				const imageSrces = imagesEmbeddedInBacklinkingFiles.map(
					(file) => {
						const resourcePath =
							this.app.vault.getResourcePath(file);
						return resourcePath;
					}
				);

				const paddingAroundGallery = 44;
				const marginBetweenImages = paddingAroundGallery / 2;

				el.style.columnWidth = paddingAroundGallery * 7 + "px";
				el.style.columnGap = marginBetweenImages + "px";

				el.parentElement.style.width = `calc(100% - ${
					paddingAroundGallery * 2
				}px)`;
				el.parentElement.style.paddingTop = `${
					paddingAroundGallery / 6
				}px`;
				el.parentElement.style.paddingBottom = `${paddingAroundGallery}px`;
				el.parentElement.style.position = "absolute";
				el.parentElement.style.left = paddingAroundGallery + "px";
				el.parentElement.style.boxShadow = "none"; // Remove the hover border.

				for (const imageSrc of imageSrces) {
					el.createEl("img", {
						cls: "image-gallery-image",
						attr: {
							src: imageSrc,
							style: `display: block; margin-bottom: ${marginBetweenImages}px; border-radius: ${marginBetweenImages}px;`,
						},
					});
				}
			}
		);
	}

	async onunload() {}
}

function getBacklinkingFiles(targetFile: TAbstractFile) {
	const backlinksByLinkingFileName =
		this.app.metadataCache.getBacklinksForFile(targetFile).data;

	const backlinkingFiles = Object.keys(backlinksByLinkingFileName).map(
		(backlinkingFilePath) => {
			return this.app.vault.getAbstractFileByPath(backlinkingFilePath);
		}
	);

	return backlinkingFiles;
}

import _ from "../../imports/lodash.js"
import { html, Component, useEffect, useState, useMemo } from "../../imports/Preact.js"

const run = (f) => f()

/**
 * @typedef SourceManifestEntry
 * @type {{
 *  id: String,
 *  hash: String,
 *  html_path: String,
 *  statefile_path: String,
 *  notebookfile_path: String,
 *  frontmatter: Record<string,any>,
 * }}
 */

/**
 * @typedef SourceManifest
 * @type {{
 *   notebooks: Record<string,SourceManifestEntry>,
 *   collections: Array<String>,
 *   pluto_version: String,
 *   julia_version: String,
 *   format_version: String,
 *   source_url: String,
 * }}
 */

export const Featured = () => {
    const [sources, set_sources] = useState(/** @type{Array<String>} */ (null))

    const [source_data, set_source_data] = useState(/** @type{Array<SourceManifest>} */ ([]))

    useEffect(() => {
        run(async () => {
            const data = await (await fetch("featured_sources.json")).json()

            set_sources(data.sources)
        })
    }, [])

    useEffect(() => {
        if (sources != null) {
            const promises = sources.map(async (src) => {
                const data = await (await fetch(src)).json()

                if (data.format_version !== "1") {
                    throw new Error(`Invalid format version: ${data.format_version}`)
                }

                set_source_data((old) => [
                    ...old,
                    {
                        ...data,
                        source_url: src,
                    },
                ])
            })
        }
    }, [sources])

    return html`
        <div class="featured">
            <h2>Featured</h2>
            <div class="featured-sources">
                ${source_data != null
                    ? source_data.map(
                          (data) => html`
                              <div class="featured-source">
                                  <h3>${data.source_url}</h3>
                                  <div class="featured-source-notebooks">
                                      ${Object.entries(data.notebooks).map(
                                          ([id, entry]) => html`
                                              <div class="featured-source-notebook">
                                                  <a href="${entry.html_path}">${entry.frontmatter.title}</a>
                                              </div>
                                          `
                                      )}
                                  </div>
                              </div>
                          `
                      )
                    : null}
            </div>
        </div>
    `
}

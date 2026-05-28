import {defineConfig, buildLegacyTheme} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Parish palette — mirrors src/tailwind.css so Studio chrome reads as part
// of the same brand system as the public site.
const cream = '#FBF8F1'
const paper = '#FFFFFF'
const ink = '#1A1612'
const muted = '#6B6359'
const blue = '#1E3A5F'
const gold = '#B89253'
const burgundy = '#730C29'

const parishTheme = buildLegacyTheme({
  '--white': paper,
  '--black': ink,
  '--gray': muted,
  '--gray-base': muted,
  '--component-bg': cream,
  '--component-text-color': ink,
  '--brand-primary': blue,
  '--default-button-color': muted,
  '--default-button-primary-color': blue,
  '--default-button-success-color': '#0f9d58',
  '--default-button-warning-color': gold,
  '--default-button-danger-color': burgundy,
  '--state-info-color': blue,
  '--state-success-color': '#0f9d58',
  '--state-warning-color': gold,
  '--state-danger-color': burgundy,
  '--main-navigation-color': ink,
  '--main-navigation-color--inverted': cream,
  '--focus-color': gold,
})

// Singletons live at fixed document IDs so the Studio can pin them in the
// structure list and the public site's GROQ queries can target them
// directly. Adding a new singleton: append here, the rest follows.
const SINGLETONS = [
  {id: 'siteSettings', type: 'csSiteSettings', title: 'Site Settings'},
  {id: 'homepage', type: 'csHomepage', title: 'Homepage'},
  {id: 'visitPage', type: 'csVisitPage', title: 'Visit Page'},
  {id: 'shepherd', type: 'csShepherd', title: 'Shepherd'},
] as const

const ParishIcon = () => (
  <img
    src="/static/favicon.svg"
    alt="Celestial Sanctum"
    style={{width: 24, height: 24, display: 'block'}}
  />
)

export default defineConfig({
  name: 'default',
  title: 'Celestial Sanctum CMS',

  projectId: 'jsf7d3td',
  dataset: 'production',

  icon: ParishIcon,
  theme: parishTheme,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Parish Content')
          .items([
            ...SINGLETONS.map((s) =>
              S.listItem()
                .id(s.id)
                .title(s.title)
                .child(
                  S.document().schemaType(s.type).documentId(s.id).title(s.title),
                ),
            ),
            S.divider(),
            S.documentTypeListItem('csAboutSection').title('About Page Sections'),
            S.documentTypeListItem('csBlogPost').title('Blog Posts'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide "Create new <singleton>" templates — there's only one of each.
    templates: (templates) =>
      templates.filter((t) => !SINGLETONS.some((s) => s.type === t.schemaType)),
  },

  document: {
    actions: (actions, context) => {
      // Singletons can be edited and published, but not deleted/duplicated/
      // unpublished — the public site reads from these IDs and the doc
      // disappearing would render an empty page.
      if (SINGLETONS.some((s) => s.type === context.schemaType)) {
        return actions.filter(
          ({action}) =>
            action !== 'unpublish' && action !== 'delete' && action !== 'duplicate',
        )
      }
      return actions
    },
  },
})

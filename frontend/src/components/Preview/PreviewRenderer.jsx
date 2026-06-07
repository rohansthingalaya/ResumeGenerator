import { useMemo, useRef, useState, useLayoutEffect } from 'react'
import { renderClassic } from '../../templates/preview/classic'
import { renderMinimal } from '../../templates/preview/minimal'
import { renderBerlinTech } from '../../templates/preview/berlin-tech'
import { renderCorporate } from '../../templates/preview/corporate'
import { renderExecutive } from '../../templates/preview/executive'

const RENDERERS = {
  classic: renderClassic,
  minimal: renderMinimal,
  'berlin-tech': renderBerlinTech,
  corporate: renderCorporate,
  executive: renderExecutive,
}

const A4_W = 794   // px at 96dpi

export function PreviewRenderer({ cvData, zoom = 1 }) {
  const template = cvData.settings?.selectedTemplate || 'classic'
  const renderer = RENDERERS[template] || renderClassic
  const html = useMemo(() => renderer(cvData), [cvData, template])

  // Measure rendered height so the outer container clips correctly.
  const innerRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(1123) // default 1 A4 page

  useLayoutEffect(() => {
    if (innerRef.current) {
      setContentHeight(innerRef.current.scrollHeight)
    }
  }, [html])

  return (
    // Outer container: exact visual size at current zoom level.
    // overflow:hidden clips the inner (unscaled DOM size) content precisely.
    <div
      style={{
        width: A4_W * zoom,
        height: contentHeight * zoom,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
        borderRadius: 2,
        flexShrink: 0,
      }}
    >
      {/* Inner content: always rendered at full 794px width, then scaled down. */}
      <div
        ref={innerRef}
        style={{
          width: A4_W,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

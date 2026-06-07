import { Award, Plus, Trash2 } from 'lucide-react'
import { Accordion } from '../UI/Accordion'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import useCvStore from '../../store/cvStore'

function CertificationEntry({ cert }) {
  const { updateCertification, removeCertification } = useCvStore()

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Input
          label="Certification"
          placeholder="AWS Certified Solutions Architect"
          value={cert.name}
          onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Input
          label="Issuer"
          placeholder="Amazon Web Services"
          value={cert.issuer}
          onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
        />
      </div>
      <div className="w-28">
        <Input
          label="Date"
          placeholder="MM/YYYY"
          value={cert.date}
          onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
        />
      </div>
      <Button variant="danger" size="sm" onClick={() => removeCertification(cert.id)} className="mb-0.5">
        <Trash2 size={12} />
      </Button>
    </div>
  )
}

export function Certifications() {
  const { cvData, addCertification } = useCvStore()

  return (
    <Accordion title="Zertifizierungen (Certifications)" icon={Award}>
      <div className="space-y-3">
        {cvData.certifications.map((cert) => (
          <CertificationEntry key={cert.id} cert={cert} />
        ))}
        <Button variant="secondary" size="sm" onClick={addCertification} className="w-full">
          <Plus size={14} />
          Add Certification
        </Button>
      </div>
    </Accordion>
  )
}

import { useState, useRef } from 'react';
import { Camera, Upload, Newspaper, Ruler, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VintageCamera } from '@/components/VintageCamera';
import { InscriptionSuccessAnimation } from '@/components/InscriptionSuccessAnimation';

const CATEGORIES = [
  'Maps', 'Diaries', 'Letters', 'Manuscripts', 'Books', 
  'Battle Plans', 'Newspapers', 'Photographs', 'Other'
];

const PROVENANCE_TYPES = [
  { id: 'newspaper', label: 'With Today\'s Newspaper', icon: Newspaper },
  { id: 'ruler', label: 'With Ruler (Scale)', icon: Ruler },
  { id: 'texture1', label: 'Paper Texture Close-up 1', icon: FileText },
  { id: 'texture2', label: 'Paper Texture Close-up 2', icon: FileText },
];

type UploadStep = 'photos' | 'provenance' | 'details' | 'pricing' | 'wallet' | 'inscribing' | 'success';

interface AnalysisResult {
  rarity_score: number;
  usefulness_score: number;
  price_per_page: number;
  analysis: string;
  estimated_pages: number;
}

export default function DocumentUploadFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<UploadStep>('photos');
  const [documentPhotos, setDocumentPhotos] = useState<File[]>([]);
  const [provenancePhotos, setProvenancePhotos] = useState<Record<string, File>>({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [pricePerPage, setPricePerPage] = useState<number>(0);
  const [walletType, setWalletType] = useState<'handcash' | 'relayx' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionData, setInscriptionData] = useState<any>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'document' | 'provenance' | null>(null);
  const [currentProvenanceType, setCurrentProvenanceType] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const provenanceInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDocumentPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentPhotos(Array.from(e.target.files));
    }
  };

  const handleProvenancePhoto = (type: string, file: File) => {
    setProvenancePhotos(prev => ({ ...prev, [type]: file }));
  };

  const openCamera = (mode: 'document' | 'provenance', provenanceType?: string) => {
    setCameraMode(mode);
    if (provenanceType) {
      setCurrentProvenanceType(provenanceType);
    }
    setShowCamera(true);
  };

  const handleCameraCapture = (file: File) => {
    if (cameraMode === 'document') {
      setDocumentPhotos(prev => [...prev, file]);
    } else if (cameraMode === 'provenance' && currentProvenanceType) {
      handleProvenancePhoto(currentProvenanceType, file);
    }
    setShowCamera(false);
    setCameraMode(null);
    setCurrentProvenanceType(null);
  };

  const captureProvenancePhoto = (type: string) => {
    openCamera('provenance', type);
  };

  const allProvenancePhotosCollected = () => {
    return PROVENANCE_TYPES.every(type => provenancePhotos[type.id]);
  };

  const analyzeDocument = async () => {
    if (!documentPhotos[0] || !title || !category) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload first document photo
      const fileExt = documentPhotos[0].name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, documentPhotos[0]);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Call AI analysis
      const { data: analysisData, error: functionError } = await supabase.functions.invoke('analyze-document', {
        body: { imageUrl: publicUrl, category, title, description }
      });

      if (functionError) throw functionError;

      setAiAnalysis(analysisData);
      setPricePerPage(analysisData.price_per_page);
      setStep('pricing');
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const connectWallet = async (type: 'handcash' | 'relayx') => {
    setWalletType(type);
    setIsProcessing(true);
    
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setStep('inscribing');
    inscribeDocument(type);
  };

  const inscribeDocument = async (wallet: 'handcash' | 'relayx') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has free inscriptions
      const { data: profile } = await supabase
        .from('profiles')
        .select('free_inscriptions_remaining, lifetime_archivist')
        .eq('id', user.id)
        .single();

      const hasFreeSlots = profile && profile.free_inscriptions_remaining > 0;

      // Upload all photos
      const uploadedDocPhotos = await Promise.all(
        documentPhotos.map(async (photo, idx) => {
          const fileExt = photo.name.split('.').pop();
          const filePath = `${user.id}/doc_${idx}_${crypto.randomUUID()}.${fileExt}`;
          await supabase.storage.from('documents').upload(filePath, photo);
          const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
          return publicUrl;
        })
      );

      const uploadedProvenancePhotos = await Promise.all(
        Object.entries(provenancePhotos).map(async ([type, photo]) => {
          const fileExt = photo.name.split('.').pop();
          const filePath = `${user.id}/prov_${type}_${crypto.randomUUID()}.${fileExt}`;
          await supabase.storage.from('documents').upload(filePath, photo);
          const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);
          return { type, url: publicUrl };
        })
      );

      let inscriptionResult;
      let treasurySponsored = false;

      // Use sponsored inscription if user has free slots
      if (hasFreeSlots) {
        const { data: sponsorData, error: sponsorError } = await supabase.functions.invoke('sponsor-inscription', {
          body: {
            documentPhotos: uploadedDocPhotos,
            provenancePhotos: uploadedProvenancePhotos,
            metadata: { title, description, category, pricePerPage },
          }
        });

        if (sponsorError || !sponsorData?.success) {
          // If treasury sponsorship fails, fall back to user payment
          console.warn('Treasury sponsorship failed, falling back to user payment:', sponsorError);
          
          if (sponsorData?.treasuryLow) {
            toast({
              title: 'Treasury Low',
              description: 'The treasury cannot sponsor this inscription. Please help grow the vault!',
              variant: 'destructive',
            });
          }
        } else {
          inscriptionResult = sponsorData;
          treasurySponsored = true;
        }
      }

      // If not sponsored, use regular inscription
      if (!treasurySponsored) {
        const { data, error: inscribeError } = await supabase.functions.invoke('inscribe-document', {
          body: {
            documentPhotos: uploadedDocPhotos,
            provenancePhotos: uploadedProvenancePhotos,
            metadata: { title, description, category, pricePerPage },
            walletType: wallet,
            walletData: { address: `${wallet}-mock-address` }
          }
        });

        if (inscribeError) throw inscribeError;
        inscriptionResult = data;
      }

      // Save to database
      const { error: dbError } = await supabase.from('documents').insert([{
        user_id: user.id,
        title,
        description,
        category,
        image_url: uploadedDocPhotos[0],
        document_photos: uploadedDocPhotos as any,
        provenance_photos: uploadedProvenancePhotos as any,
        rarity_score: aiAnalysis!.rarity_score,
        usefulness_score: aiAnalysis!.usefulness_score,
        price_per_page: pricePerPage,
        total_pages: aiAnalysis!.estimated_pages,
        ai_analysis: aiAnalysis as any,
        inscription_txid: inscriptionResult.txid,
        wallet_address: inscriptionResult.walletAddress,
        payable_link: inscriptionResult.payableLink,
        status: 'inscribed'
      }]);

      if (dbError) throw dbError;

      setInscriptionData({ ...inscriptionResult, treasurySponsored });
      setStep('success');
    } catch (error) {
      console.error('Inscription error:', error);
      toast({
        title: 'Inscription Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      setStep('wallet');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {showCamera && (
        <VintageCamera
          onCapture={handleCameraCapture}
          onClose={() => {
            setShowCamera(false);
            setCameraMode(null);
            setCurrentProvenanceType(null);
          }}
        />
      )}
      
      {step === 'photos' && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Step 1: Capture Document Photos</h2>
          <p className="text-muted-foreground mb-6">Take photos of all pages in your document</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleDocumentPhotos}
            className="hidden"
          />
          
          <Button onClick={() => openCamera('document')} className="w-full mb-4">
            <Camera className="mr-2" style={{ color: 'hsl(30 25% 10%)' }} />
            Capture Document Pages ({documentPhotos.length} photos)
          </Button>

          {documentPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {documentPhotos.map((photo, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(photo)}
                  alt={`Page ${idx + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <Button
            onClick={() => setStep('provenance')}
            disabled={documentPhotos.length === 0}
            className="w-full"
          >
            Next: Provenance Photos
          </Button>
        </Card>
      )}

      {step === 'provenance' && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Step 2: Provenance Photos</h2>
          <p className="text-muted-foreground mb-6">Required: 4 verification photos</p>
          
          <input
            ref={provenanceInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="space-y-4 mb-6">
            {PROVENANCE_TYPES.map(({ id, label, icon: Icon }) => (
              <div key={id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </div>
                {provenancePhotos[id] ? (
                  <CheckCircle 
                    className="w-5 h-5" 
                    style={{ color: 'hsl(120 60% 50%)' }}
                  />
                ) : (
                  <Button onClick={() => captureProvenancePhoto(id)} size="sm">
                    <Camera className="w-4 h-4 mr-1" style={{ color: 'hsl(30 25% 10%)' }} />
                    Capture
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep('details')}
            disabled={!allProvenancePhotosCollected()}
            className="w-full"
          >
            Next: Document Details
          </Button>
        </Card>
      )}

      {step === 'details' && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Step 3: Document Details</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Civil War Battle Map"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the document's history and significance"
                rows={4}
              />
            </div>

            <Button
              onClick={analyzeDocument}
              disabled={!title || !category || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </Card>
      )}

      {step === 'pricing' && aiAnalysis && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Step 4: AI Analysis & Pricing</h2>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Rarity Score</div>
                  <div className="text-2xl font-bold">{aiAnalysis.rarity_score}/100</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Usefulness</div>
                  <div className="text-2xl font-bold">{aiAnalysis.usefulness_score}/100</div>
                </div>
              </div>
              <div className="text-sm">{aiAnalysis.analysis}</div>
            </div>

            <div>
              <Label htmlFor="price">Price Per Page View (satoshis)</Label>
              <Input
                id="price"
                type="number"
                value={pricePerPage}
                onChange={(e) => setPricePerPage(Number(e.target.value))}
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                AI suggested: {aiAnalysis.price_per_page} sats
              </p>
            </div>
          </div>

          <Button onClick={() => setStep('wallet')} className="w-full">
            Next: Connect Wallet
          </Button>
        </Card>
      )}

      {step === 'wallet' && (
        <div className="glass-card-strong p-8">
          <h2 className="text-3xl font-bold mb-4 neon-glow">Step 5: Connect BSV Wallet</h2>
          <p className="text-muted-foreground mb-8">Choose your wallet to inscribe on BSV blockchain</p>
          
          <div className="space-y-4">
            <Button
              onClick={() => connectWallet('handcash')}
              disabled={isProcessing}
              variant="wallet"
              className="w-full"
            >
              {isProcessing && walletType === 'handcash' ? 'Connecting...' : 'Connect HandCash'}
            </Button>
            
            <Button
              onClick={() => connectWallet('relayx')}
              disabled={isProcessing}
              variant="wallet"
              className="w-full"
            >
              {isProcessing && walletType === 'relayx' ? 'Connecting...' : 'Connect RelayX'}
            </Button>
          </div>
        </div>
      )}

      {step === 'inscribing' && (
        <Card className="p-6 text-center">
          <div className="animate-pulse mb-4">
            <Upload 
              className="w-16 h-16 mx-auto" 
              style={{ color: 'hsl(38 60% 45%)', stroke: 'hsl(38 60% 45%)' }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">Inscribing to BSV Blockchain</h2>
          <p className="text-muted-foreground">Please wait while we inscribe your document as a 1Sat Ordinal...</p>
        </Card>
      )}

      {step === 'success' && inscriptionData && (
        <InscriptionSuccessAnimation 
          onClose={onComplete}
          documentTitle={title}
          txid={inscriptionData.txid}
          treasurySponsored={inscriptionData.treasurySponsored || false}
        />
      )}
    </div>
  );
}

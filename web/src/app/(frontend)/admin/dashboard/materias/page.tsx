'use client'
import type { MateriaWithTopico } from "@/types";
import { LibraryBig, Plus } from "lucide-react";
import { useState } from "react";
import useSWR from 'swr'
import AdminHeader from "../components/header/AdminHeader";
import MateriaCard from "./MateriaCard";
import FileUploadInput from "@/components/input/FileUpload";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar matérias")
    return res.json()
  })

const EMPTY_MATERIA = {
  name: '',
  slug: '',
  cor: '#ffffff',
  descricao: '',
  imgUrl: '' as string
}

function DashboardPage() {
  const { data: materias, error, isLoading, mutate } = useSWR<MateriaWithTopico[]>('/api/materia', fetcher)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_MATERIA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleFileUpload = (file: { url: string } | null) => {
    setFormData(prev => ({
      ...prev,
      imgUrl: file?.url || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const body = {
        name: formData.name,
        slug: formData.slug,
        cor: formData.cor,
        descricao: formData.descricao,
        imgUrl: formData.imgUrl,
      };

      const response = await fetch('/api/materia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response error data:', errorData);
        throw new Error(errorData.error || 'Erro ao criar matéria');
      }

      const result = await response.json();

      mutate();
      setFormData(EMPTY_MATERIA);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar matéria: ' + String(error))
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_MATERIA);
    setIsDialogOpen(false);
  };

  const Paragraph = () => (
    <>
      São as bases/grandes áreas de conhecimento. A edição aqui é mais estética e serve para depois adicionar tópicos cuja origem é essa matéria
    </>
  )

  return ( 
    <>
      <AdminHeader
        Icon={LibraryBig}
        Paragraph={Paragraph}
        title="Matérias"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button type="button" className="admin-header-button colorTransition">
              <Plus /> Adicionar Matérias
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white rounded-lg">
            <DialogHeader className="flex flex-row items-center justify-between pb-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Adicionar Matéria
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Matéria */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nome da Matéria*
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Astronomia"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
                  Descrição*
                </Label>
                <Input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da matéria"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                  Slug* <span className="text-xs text-gray-500">(fins de indexação no site)</span>
                </Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="astronomia"
                  className="w-full"
                  required
                />
              </div>

              <FileUploadInput
                arquivo={formData.imgUrl ? { name: formData.imgUrl.split('/').pop() || '', url: formData.imgUrl } : null}
                handleFileUpload={handleFileUpload}
                accept=".svg,.webp,.avif,.png,.jpg,.jpeg"
                maxSize={5}
              >
                <Label className="text-sm font-medium text-gray-700">
                  Ícone/Logo* <span className="text-xs text-gray-500">(já com a cor, preferir svg ou webp/avif)</span>
                </Label>
              </FileUploadInput>

              <div className="space-y-2">
                <Label htmlFor="cor" className="text-sm font-medium text-gray-700">
                  Cor da Matéria*
                </Label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">#</span>
                    <Input
                      id="cor"
                      type="text"
                      value={formData.cor.replace('#', '')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cor: '#' + e.target.value.replace('#', '') 
                      }))}
                      className="w-20 text-center"
                      maxLength={6}
                      pattern="[0-9A-Fa-f]{6}"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.slug || !formData.descricao}
                  className="px-6 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {isSubmitting ? 'Adicionando...' : 'Adicionar Matéria →'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AdminHeader>

      <main className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,_minmax(0,_260px))]">
        {isLoading && <p>Carregando matérias...</p>}
        {error && <p>Erro ao carregar matérias.</p>}
        {materias?.map(materia => (
          <MateriaCard key={materia.id} materia={materia} />
        ))}
      </main>
    </>
   );
}

export default DashboardPage;
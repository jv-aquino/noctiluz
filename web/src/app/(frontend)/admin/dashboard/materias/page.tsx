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

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar matérias")
    return res.json()
  })

const EMPTY_MATERIA = {
    nome: '',
    slug: '',
    cor: '#ffffff',
    imgUrl: null as File | null
  }

function DashboardPage() {
  const { data: materias, error, isLoading, mutate } = useSWR<MateriaWithTopico[]>('/api/materia', fetcher)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_MATERIA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para gerar slug automaticamente
  const generateSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handler para mudança no nome
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setFormData(prev => ({
      ...prev,
      nome,
      slug: generateSlug(nome)
    }));
  };

  // Handler para upload de arquivo
  const handleFileUpload = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      imgUrl: file
    }));
  };

  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('cor', formData.cor);
      
      if (formData.imgUrl) {
        formDataToSend.append('imgUrl', formData.imgUrl);
      }

      const response = await fetch('/api/materia', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Erro ao criar matéria');
      }

      // Atualizar a lista de matérias
      mutate();
      
      // Resetar o formulário e fechar o dialog
      setFormData(EMPTY_MATERIA);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar matéria:', error);
      // Aqui você pode adicionar uma notificação de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para cancelar
  const handleCancel = () => {
    setFormData(EMPTY_MATERIA);
    setIsDialogOpen(false);
  };

  const Paragraph = () => (
    <>
      São as bases/grandes áreas de conhecimento. A edição aqui é mais estética<br/>
      e serve para depois adicionar tópicos cuja origem é essa matéria
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
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                  Nome da Matéria*
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleNomeChange}
                  placeholder="Astronomia"
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

              {/* Ícone/Logo */}
              <FileUploadInput
                arquivo={formData.imgUrl}
                handleFileUpload={handleFileUpload}
                accept=".svg,.webp,.avif,.png,.jpg,.jpeg"
                maxSize={5}
              >
                <Label className="text-sm font-medium text-gray-700">
                  Ícone/Logo* <span className="text-xs text-gray-500">(já com a cor, preferir svg ou webp/avif)</span>
                </Label>
              </FileUploadInput>

              {/* Cor da Matéria */}
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

              {/* Botões */}
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
                  disabled={isSubmitting || !formData.nome || !formData.slug}
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
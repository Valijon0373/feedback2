"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { reviewsApi } from "@/lib/api"

interface ReviewFormProps {
  teacherId: string
  onReviewSubmitted?: () => void
}

export function ReviewForm({ teacherId, onReviewSubmitted }: ReviewFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reviewer_name: "",
    rating: "5",
    teaching_quality: "5",
    communication: "5",
    professional_knowledge: "5",
    approachability: "5",
    comment: "",
    anonymous: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await reviewsApi.save({
        ...formData,
        teacherId: teacherId,
        rating: Number.parseInt(formData.rating),
        teaching_quality: Number.parseInt(formData.teaching_quality),
        communication: Number.parseInt(formData.communication),
        professional_knowledge: Number.parseInt(formData.professional_knowledge),
        approachability: Number.parseInt(formData.approachability),
      })

      toast({
        title: "Muvaffaqiyat!",
        description: "Sharhingiz qabul qilindi.",
      })

      setFormData({
        reviewer_name: "",
        rating: "5",
        teaching_quality: "5",
        communication: "5",
        professional_knowledge: "5",
        approachability: "5",
        comment: "",
        anonymous: false,
      })

      onReviewSubmitted?.()
    } catch (error) {
      toast({
        title: "Xato!",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Sharh yuborishda xato yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-8">
        <CardTitle>O'qituvchi haqida sharh bering</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ismi (opsional)</label>
              <Input
                placeholder="Ismingiz"
                value={formData.reviewer_name}
                onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                  className="rounded"
                />
                Anonim qoldirish
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {["rating", "professional_knowledge", "teaching_quality", "communication", "approachability"].map(
              (field) => (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-medium capitalize">
                    {field === "rating" && "Umumiy"}
                    {field === "professional_knowledge" && "Kasbiy kompetensiya"}
                    {field === "teaching_quality" && "O'qitish samaradorligi"}
                    {field === "communication" && "Muloqot madaniyati"}
                    {field === "approachability" && "Talabalarga munosabati"}
                  </label>
                  <Select
                    value={formData[field as keyof typeof formData] as string}
                    onValueChange={(value) => setFormData({ ...formData, [field]: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sharh</label>
            <Textarea
              placeholder="Fikringizni yozing..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Yuborilmoqda..." : "Sharh yuborish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

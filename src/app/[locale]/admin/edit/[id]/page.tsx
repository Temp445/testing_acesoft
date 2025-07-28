'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'be', name: 'Bengali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'kr', name: 'Korean' },
  { code: 'br', name: 'Portuguese' },
  { code: 'it', name: 'Italy' },
  { code: 'ru', name: 'Russian' }
];

interface LocalizedString {
  [key: string]: string;
}

interface Benefit {
  title: LocalizedString;
  description: LocalizedString;
}

interface Testimonial {
  clientName: LocalizedString;
  companyName: string;
  description: LocalizedString;
}

interface Plan {
  name: LocalizedString;
  pricedescription: LocalizedString;
  price: string;
  features: LocalizedString;
}

interface ProductData {
  productName: string;
  productLink: string;
  calendlyUrl: string;
  productPath: string;
  description: LocalizedString;
  why_choose_des: LocalizedString;
  who_need_des: LocalizedString;
  category: LocalizedString;
  benefits: Benefit[];
  customerTestimonials: Testimonial[];
  plans: Plan[];
  imageUrl?: string;
  gallery?: string[];
}

const ProductEdit: React.FC = () => {
  const params = useParams();
  const id = (params as { id: string }).id;

  const [activeLanguages, setActiveLanguages] = useState<string[]>(['en']);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const [productData, setProductData] = useState<ProductData>({
    productName: '',
    productLink: '',
    calendlyUrl: '',
    productPath: '',
    description: { en: '' },
    why_choose_des: { en: '' },
    who_need_des: { en: '' },
    category: { en: '' },
    benefits: [],
    customerTestimonials: [],
    plans: [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewGallery, setPreviewGallery] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/product/${id}`);
        const data = res.data;

        const detectedLanguages = new Set<string>(['en']);

        if (data.description && typeof data.description === 'object') {
          Object.keys(data.description).forEach(lang => detectedLanguages.add(lang));
        }

        const convertToLocalized = (field: any): LocalizedString => {
          if (typeof field === 'string') {
            return { en: field };
          }
          return field || { en: '' };
        };

        const convertBenefits = (benefits: any[]): Benefit[] => {
          return (benefits || []).map(benefit => ({
            title: convertToLocalized(benefit.title),
            description: convertToLocalized(benefit.description)
          }));
        };

        const convertTestimonials = (testimonials: any[]): Testimonial[] => {
          return (testimonials || []).map(testimonial => ({
            clientName: convertToLocalized(testimonial.clientName),
            companyName: testimonial.companyName || '',
            description: convertToLocalized(testimonial.description)
          }));
        };

        const convertPlans = (plans: any[]): Plan[] => {
          return (plans || []).map(plan => ({
            name: convertToLocalized(plan.name),
            pricedescription: convertToLocalized(plan.pricedescription),
            price: plan.price || '',
            features: convertToLocalized(plan.features)
          }));
        };

        setActiveLanguages(Array.from(detectedLanguages));
        setProductData({
          productName: data.productName || '',
          productLink: data.productLink || '',
          calendlyUrl: data.calendlyUrl || '',
          productPath: data.productPath || '',
          description: convertToLocalized(data.description),
          why_choose_des: convertToLocalized(data.why_choose_des),
          who_need_des: convertToLocalized(data.who_need_des),
          category: convertToLocalized(data.category),
          benefits: convertBenefits(data.benefits),
          customerTestimonials: convertTestimonials(data.customerTestimonials),
          plans: convertPlans(data.plans),
        });

        if (data.imageUrl) {
          setPreviewImages([data.imageUrl]);
        }
        if (data.gallery) {
          setPreviewGallery(data.gallery);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      }
    };
    fetchProduct();
  }, [id]);

  const addLanguage = (langCode: string) => {
    if (!activeLanguages.includes(langCode)) {
      setActiveLanguages([...activeLanguages, langCode]);

      setProductData(prev => ({
        ...prev,
        category: { ...prev.category, [langCode]: '' },
        description: { ...prev.description, [langCode]: '' },
        why_choose_des: { ...prev.why_choose_des, [langCode]: '' },
        who_need_des: { ...prev.who_need_des, [langCode]: '' },
        benefits: prev.benefits.map(benefit => ({
          ...benefit,
          title: { ...benefit.title, [langCode]: '' },
          description: { ...benefit.description, [langCode]: '' }
        })),
        customerTestimonials: prev.customerTestimonials.map(testimonial => ({
          ...testimonial,
          clientName: { ...testimonial.clientName, [langCode]: '' },
          description: { ...testimonial.description, [langCode]: '' }
        })),
        plans: prev.plans.map(plan => ({
          ...plan,
          name: { ...plan.name, [langCode]: '' },
          pricedescription: { ...plan.pricedescription, [langCode]: '' },
          features: { ...plan.features, [langCode]: '' }
        }))
      }));
    }
    setShowLanguageDropdown(false);
  };

  const removeLanguage = (langCode: string) => {
    if (langCode === 'en') return;

    const newActiveLanguages = activeLanguages.filter(lang => lang !== langCode);
    setActiveLanguages(newActiveLanguages);

    setProductData(prev => {
      const removeFromObject = (obj: LocalizedString) => {
        const newObj = { ...obj };
        delete newObj[langCode];
        return newObj;
      };

      return {
        ...prev,
        category: removeFromObject(prev.category),
        description: removeFromObject(prev.description),
        why_choose_des: removeFromObject(prev.why_choose_des),
        who_need_des: removeFromObject(prev.who_need_des),
        benefits: prev.benefits.map(benefit => ({
          ...benefit,
          title: removeFromObject(benefit.title),
          description: removeFromObject(benefit.description)
        })),
        customerTestimonials: prev.customerTestimonials.map(testimonial => ({
          ...testimonial,
          clientName: removeFromObject(testimonial.clientName),
          description: removeFromObject(testimonial.description)
        })),
        plans: prev.plans.map(plan => ({
          ...plan,
          name: removeFromObject(plan.name),
          pricedescription: removeFromObject(plan.pricedescription),
          features: removeFromObject(plan.features)
        }))
      };
    });
  };

  const getLanguageName = (code: string) => {
    return AVAILABLE_LANGUAGES.find(lang => lang.code === code)?.name || code.toUpperCase();
  };

  const getAvailableLanguagesForDropdown = () => {
    return AVAILABLE_LANGUAGES.filter(lang => !activeLanguages.includes(lang.code));
  };

  const handleLocalizedChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    lang: string,
    field: keyof ProductData
  ) => {
    setProductData(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as LocalizedString),
        [lang]: e.target.value,
      },
    }));
  };

  const handleNestedLocalizedChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    lang: string,
    index: number,
    type: "benefits" | "customerTestimonials" | "plans",
    field: "title" | "description" | "clientName" | "name" | "features" | "pricedescription"
  ) => {
    const updated = [...productData[type]];

    if (type === "benefits" && (field === "title" || field === "description")) {
      const benefit = updated[index] as Benefit;
      benefit[field] = {
        ...(benefit[field] as LocalizedString),
        [lang]: e.target.value,
      };
    }

    if (
      type === "customerTestimonials" &&
      (field === "clientName" || field === "description")
    ) {
      const testimonial = updated[index] as Testimonial;
      testimonial[field] = {
        ...(testimonial[field] as LocalizedString),
        [lang]: e.target.value,
      };
    }

    if (type === "plans" && (field === "name" || field === "features" || field === "pricedescription")) {
      const plan = updated[index] as Plan;
      plan[field] = {
        ...(plan[field] as LocalizedString),
        [lang]: e.target.value,
      };
    }

    setProductData({ ...productData, [type]: updated });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, type: 'imageUrl' | 'gallery') => {
    const files = Array.from(e.target.files || []);
    if (type === 'imageUrl') {
      setImageFiles(files);
      setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    } else if (type === 'gallery') {
      setGalleryFiles(files);
      setPreviewGallery(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const addField = (type: "benefits" | "customerTestimonials" | "plans") => {
    const emptyLocalized: LocalizedString = {};
    activeLanguages.forEach(lang => {
      emptyLocalized[lang] = '';
    });

    let newField: any;
    if (type === "benefits") newField = { title: { ...emptyLocalized }, description: { ...emptyLocalized } };
    if (type === "customerTestimonials") newField = { clientName: { ...emptyLocalized }, companyName: '', description: { ...emptyLocalized } };
    if (type === "plans") newField = { name: { ...emptyLocalized }, pricedescription: { ...emptyLocalized }, price: '', features: { ...emptyLocalized } };

    setProductData({ ...productData, [type]: [...productData[type], newField] });
  };

  const removeField = (
    index: number,
    type: keyof Pick<ProductData, 'benefits' | 'customerTestimonials' | 'plans'>
  ) => {
    const updatedFields = [...productData[type]];
    updatedFields.splice(index, 1);
    setProductData({ ...productData, [type]: updatedFields });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append('imageUrl', file));
    galleryFiles.forEach((file) => formData.append('gallery', file));

    Object.keys(productData).forEach((key) => {
      const value = productData[key as keyof ProductData];
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, typeof value === "object" ? JSON.stringify(value) : value as string);
      }
    });

    try {
      const res = await axios.put(`${apiUrl}/api/product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product updated successfully!');
      window.location.href = '/admin';
    } catch (err) {
      console.error(err);
      alert('Error updating product. Please Try Later');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border border-gray-200 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Product</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Languages</h3>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
              disabled={getAvailableLanguagesForDropdown().length === 0}
            >
              Add Language
            </button>
            {showLanguageDropdown && getAvailableLanguagesForDropdown().length > 0 && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[150px]">
                {getAvailableLanguagesForDropdown().map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => addLanguage(lang.code)}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {activeLanguages.map(langCode => (
            <div key={langCode} className="flex items-center bg-white border border-gray-300 rounded px-3 py-1">
              <span className="text-sm mr-2">{getLanguageName(langCode)}</span>
              {langCode !== 'en' && (
                <button
                  type="button"
                  onClick={() => removeLanguage(langCode)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            name="productName"
            type="text"
            placeholder="Product Name"
            value={productData.productName || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Product Link :</label>
          <input
            type="text"
            name="productLink"
            placeholder="Product Link"
            value={productData.productLink || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Calendly Url :</label>
          <input
            type="text"
            name="calendlyUrl"
            placeholder="Calendly Url"
            value={productData.calendlyUrl || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Product Path :</label>
          <input
            type="text"
            name="productPath"
            placeholder="Product Path"
            value={productData.productPath || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Description</label>
          {activeLanguages.map(lang => (
            <textarea
              key={lang + "desc"}
              placeholder={`Description (${getLanguageName(lang)})`}
              value={productData.description[lang] || ''}
              onChange={e => handleLocalizedChange(e, lang, "description")}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ))}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Why Choose This?</label>
          {activeLanguages.map(lang => (
            <textarea
              key={lang + "why"}
              placeholder={`Why Choose Description (${getLanguageName(lang)})`}
              value={productData.why_choose_des[lang] || ''}
              onChange={e => handleLocalizedChange(e, lang, "why_choose_des")}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ))}
        </div>

        <h3 className="text-[16px] md:text-lg font-semibold mt-6">Benefits</h3>
        {productData.benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col gap-3 px-2 border border-gray-200 p-3 rounded mb-4">
            {activeLanguages.map((lang) => (
              <div key={lang} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Title ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={benefit.title[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "benefits", "title")}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  aria-label={`Benefit Title (${getLanguageName(lang)})`}
                />

                <label className="text-sm font-medium text-gray-600">Description ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={benefit.description[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "benefits", "description")}
                  className="w-full p-2 border border-gray-300 rounded"
                  aria-label={`Benefit Description (${getLanguageName(lang)})`}
                />
              </div>
            ))}
            <button type="button" onClick={() => removeField(index, "benefits")} className="text-red-500 text-sm mt-2 text-left">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addField("benefits")} className="bg-black hover:bg-blue-500 text-white px-3 py-2 rounded text-sm">Add Benefit</button>

        {/* Who Need Description Fields */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Who Needs This?</label>
          {activeLanguages.map(lang => (
            <textarea
              key={lang + "who"}
              placeholder={`Who Need Description (${getLanguageName(lang)})`}
              value={productData.who_need_des[lang] || ''}
              onChange={e => handleLocalizedChange(e, lang, "who_need_des")}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ))}
        </div>

        <div>
          <label className="block mb-2">Category :</label>
          {activeLanguages.map(lang => (

            <input
              key={lang + "category"}
              placeholder={`Category (${getLanguageName(lang)})`}
              value={productData.category[lang] || ''}
              onChange={e => handleLocalizedChange(e, lang, "category")}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          ))}

        </div>

        <div>
          <label className="block mb-2">Main Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageChange(e, "imageUrl")}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label='Main Image'
          />
          <div className="flex space-x-2 mt-2">
            {previewImages.map((img, index) => (
              <img key={index} src={img} alt={`preview-${index}`} className="w-16 h-16 rounded" />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">Gallery Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageChange(e, "gallery")}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label='Product Images'
          />
          <div className="flex space-x-2 mt-2">
            {previewGallery.map((img, index) => (
              <img key={index} src={img} alt={`gallery-${index}`} className="w-16 h-16 rounded" />
            ))}
          </div>
        </div>

        {/* customerTestimonials */}
        <h3 className="text-[16px] md:text-lg mt-4">Customer Testimonials</h3>
        {productData.customerTestimonials.map((testimonial, index) => (
          <div key={index} className="flex flex-col gap-3 px-2 border p-3 rounded mb-3">
            {activeLanguages.map((lang) => (
              <div key={lang} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Client Name ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={testimonial.clientName[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "customerTestimonials", "clientName")}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  aria-label={`Testimonial Client Name (${getLanguageName(lang)})`}
                />
                <label className="text-sm font-medium text-gray-600">Description ({getLanguageName(lang)})</label>
                <textarea
                  value={testimonial.description[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "customerTestimonials", "description")}
                  className="w-full p-2 border border-gray-300 rounded"
                  aria-label={`Testimonial Description (${getLanguageName(lang)})`}
                />
              </div>
            ))}
            <input
              type="text"
              placeholder="Company Name"
              value={testimonial.companyName}
              onChange={(e) => {
                const updated = [...productData.customerTestimonials];
                updated[index].companyName = e.target.value;
                setProductData({ ...productData, customerTestimonials: updated });
              }}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
            <button type="button" onClick={() => removeField(index, "customerTestimonials")} className="text-red-500 text-sm text-left">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addField("customerTestimonials")} className="bg-black hover:bg-blue-500 text-white px-2 py-1.5 rounded text-sm">Add Testimonial</button>

        {/* Plans */}
        <h3 className="text-lg font-semibold mt-4">Plans</h3>
        {productData.plans.map((plan, index) => (
          <div key={index} className="flex flex-col gap-3 px-3 border p-3 rounded mb-3">
            {activeLanguages.map((lang) => (
              <div key={lang} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600">Plan Name ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={plan.name[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "plans", "name")}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  aria-label={`Plan Name (${getLanguageName(lang)})`}
                />
                <label className="text-sm font-medium text-gray-600">Plan Description ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={plan.pricedescription[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "plans", "pricedescription")}
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                  aria-label={`Plan Price Description (${getLanguageName(lang)})`}
                />
                <label className="text-sm font-medium text-gray-600">Features ({getLanguageName(lang)})</label>
                <input
                  type="text"
                  value={plan.features[lang] || ''}
                  onChange={(e) => handleNestedLocalizedChange(e, lang, index, "plans", "features")}
                  className="w-full p-2 border border-gray-300 rounded"
                  aria-label={`Plan Features (${getLanguageName(lang)})`}
                />
              </div>
            ))}
            <input
              type="text"
              placeholder="Price"
              value={plan.price}
              onChange={(e) => {
                const updated = [...productData.plans];
                updated[index].price = e.target.value;
                setProductData({ ...productData, plans: updated });
              }}
              className="w-full p-2 border border-gray-300 rounded mt-2"
            />
            <button type="button" onClick={() => removeField(index, "plans")} className="text-red-500 text-sm text-left">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addField("plans")} className="bg-black hover:bg-blue-500 text-white px-2 py-1.5 rounded text-[14px]">Add Plan</button>

        <div className="flex justify-between space-x-4 mt-4">
          <button
            type="submit"
            className="w-1/2 bg-black text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Update Product
          </button>
          <button
            type="button"
            onClick={() => window.location.href = "/admin"}
            className="w-1/2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-red-600 text-[14px]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
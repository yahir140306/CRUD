import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ViewChild, ElementRef, signal } from '@angular/core';
import { Product } from '../../models/product';
import { form, FormField, submit, required, min, minLength } from '@angular/forms/signals';

@Component({
  selector: 'app-form',
  imports: [FormField],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnChanges {
  @ViewChild('imageInput') imageInput!: ElementRef;

  @Input() product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageBase64: '',
  };

  @Output() newProductEvent = new EventEmitter<Product>();

  protected readonly productModel = signal({
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageBase64: '',
  });

  protected readonly productForm = form(this.productModel, (s) => {
    required(s.name, { message: 'Nombre es requerido' });
    minLength(s.name, 5, { message: 'Mínimo 5 caracteres' });
    
    required(s.description, { message: 'Descripción es requerida' });
    
    required(s.price, { message: 'Precio es requerido' });
    min(s.price, 0, { message: 'El precio no puede ser negativo' });
    
    required(s.stock, { message: 'Stock es requerido' });
    min(s.stock, 0, { message: 'El stock no puede ser negativo' });
    
    required(s.category, { message: 'Categoría es requerida' });
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.productModel.set({
        id: this.product.id || 0,
        name: this.product.name || '',
        description: this.product.description || '',
        price: this.product.price || 0,
        stock: this.product.stock || 0,
        category: this.product.category || '',
        imageBase64: this.product.imageBase64 || '',
      });
    }
  }

  onSubmit(): void {
    submit(this.productForm, async () => {
      this.newProductEvent.emit(this.productModel());
      this.clean();
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.productModel.update(m => ({ ...m, imageBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  clean(): void {
    this.productModel.set({
      id: 0,
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageBase64: '',
    });
    this.productForm().reset();
    
    if (this.imageInput && this.imageInput.nativeElement) {
      this.imageInput.nativeElement.value = '';
    }
  }
}

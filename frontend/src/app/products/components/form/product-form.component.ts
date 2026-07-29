import { Component, EventEmitter, Input, Output, inject, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '../../models/product';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  // Producto por defecto cuando no se está editando
  @Input() product: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageBase64: '',
  };

  // Evento que notifica al componente padre cuando se crea o edita un producto
  @Output() newProductEvent = new EventEmitter<Product>();

  // Definición del formulario reactivo con validaciones
  productForm = this.fb.nonNullable.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    imageBase64: [''],
  });

  // Cuando el padre cambia el producto (al editar), actualizamos el formulario
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.productForm.patchValue({
        id: this.product.id,
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock,
        category: this.product.category,
        imageBase64: this.product.imageBase64 || '',
      });
    }
  }

  // Envía los datos del formulario al componente padre
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.newProductEvent.emit(this.productForm.getRawValue());
    this.clean();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.productForm.patchValue({ imageBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  // Limpia el formulario a sus valores por defecto
  clean(): void {
    this.productForm.reset({
      id: 0,
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageBase64: '',
    });
  }
}

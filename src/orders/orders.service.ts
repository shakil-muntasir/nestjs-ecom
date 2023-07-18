import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto, OrderedProduct } from './orders.dto';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/products.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private productService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let totalPrice = 0;

    const orderedProducts = [];

    for (const orderedProduct of createOrderDto.orderedProducts) {
      const product = await this.productService.findOne(orderedProduct.id);

      if (!product) {
        throw new NotFoundException(`Product with id ${orderedProduct.id} not found`);
      }

      totalPrice += product.price * orderedProduct.quantity;

      orderedProducts.push(product);
    }

    createOrderDto.totalPrice = totalPrice;
    createOrderDto.orderedProducts = orderedProducts;

    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOneBy(id: number): Promise<Order> {
    const order = await this.orderRepository.findOneBy({id});
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }
  async findOrdersByUser(userId: number, currentUser: User): Promise<Order[]> {
    // Check if the authenticated user is the same as the one whose orders are being retrieved
    if (currentUser.id !== userId) {
      throw new ForbiddenException('You are not allowed to view other users\' orders.');
    }
  
    const orders = await this.orderRepository.find({ where: { userId } });
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No orders found for user with ID ${userId}`);
    }
  
    return orders;
  }
  async update(id: number, updateOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.findOneBy(id);
    updateOrderDto.createdAt = order.createdAt;
    const updatedOrder = {
      ...order,
      ...updateOrderDto,
    };
  
    return this.orderRepository.save(updatedOrder);
  }
  async remove(id: number): Promise<Order> {
    const order = await this.findOneBy(id);
    return this.orderRepository.remove(order);
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';
import { ProductsService } from 'src/products/products.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { OrderedProduct } from './orders.dto';
import { User } from 'src/users/users.entity';

@Controller('/orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @Post('/')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee', 'customer']))
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }
  
  @Get('/')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee']))
  async findAll() {
    return this.orderService.findAll();
  }
  @Get('/:id')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee']))
  async findOne(@Param('id') id: number) {
    return this.orderService.findOneBy(id);
  }

  @Get('/user/:userId')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee', 'customer']))
  async getUserOrders(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() request: Request,
  ) {
    const currentUser: User = request['user']; 

    const orders = await this.orderService.findOrdersByUser(userId, currentUser);
    return orders;
  }

  @Patch('/:id')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee']))
  async update(@Param('id') id: number, @Body() updateOrderDto: CreateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }
  @Delete('/:id')
  @UseGuards(new RoleGuard(['admin', 'manager', 'employee']))
  async remove(@Param('id') id: number) {
    return this.orderService.remove(id);
  }


}
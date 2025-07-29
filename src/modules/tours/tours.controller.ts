import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourCategoryDto } from './dto/create-tour-category.dto';
import { UpdateTourCategoryDto } from './dto/update-tour-category.dto';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  // Tour Categories Endpoints
  @Post('categories')
  @ApiOperation({ summary: 'Create a new tour category' })
  @ApiResponse({ status: 201, description: 'Tour category created successfully' })
  createCategory(@Body() createTourCategoryDto: CreateTourCategoryDto) {
    return this.toursService.createCategory(createTourCategoryDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all tour categories' })
  @ApiResponse({ status: 200, description: 'List of tour categories' })
  findAllCategories() {
    return this.toursService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a tour category by ID' })
  @ApiResponse({ status: 200, description: 'Tour category found' })
  @ApiResponse({ status: 404, description: 'Tour category not found' })
  findCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findCategoryById(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a tour category' })
  @ApiResponse({ status: 200, description: 'Tour category updated successfully' })
  @ApiResponse({ status: 404, description: 'Tour category not found' })
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourCategoryDto: UpdateTourCategoryDto
  ) {
    return this.toursService.updateCategory(id, updateTourCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a tour category' })
  @ApiResponse({ status: 200, description: 'Tour category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tour category not found' })
  removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.removeCategory(id);
  }

  // Tours Endpoints
  @Post()
  @ApiOperation({ summary: 'Create a new tour' })
  @ApiResponse({ status: 201, description: 'Tour created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tours with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of tours' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search tours by name, description, or location' })
  findAll(
    @Query('category') category?: string,
    @Query('search') search?: string
  ) {
    if (category) {
      return this.toursService.findByCategory(parseInt(category));
    }
    
    if (search) {
      return this.toursService.searchTours(search);
    }
    
    return this.toursService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tour by ID' })
  @ApiResponse({ status: 200, description: 'Tour found' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tour' })
  @ApiResponse({ status: 200, description: 'Tour updated successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto
  ) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tour' })
  @ApiResponse({ status: 200, description: 'Tour deleted successfully' })
  @ApiResponse({ status: 404, description: 'Tour not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.remove(id);
  }
}
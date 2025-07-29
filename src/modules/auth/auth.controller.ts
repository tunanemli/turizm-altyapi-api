import { 
  Controller, 
  Post, 
  Get,
  Patch,
  Body, 
  Request,
  UseGuards, 
  HttpCode, 
  HttpStatus,
  ParseIntPipe,
  Param 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginResponse } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiBearerAuth()
  async getProfile(@Request() req): Promise<any> {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiBearerAuth()
  async refreshToken(@Request() req): Promise<LoginResponse> {
    return this.authService.refreshToken(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiBearerAuth()
  async verifyEmail(@Request() req): Promise<{ message: string }> {
    await this.authService.verifyEmail(req.user.sub);
    return { message: 'Email verified successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-permissions/:permission')
  @ApiOperation({ summary: 'Check if user has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  @ApiBearerAuth()
  async checkPermission(
    @Request() req,
    @Param('permission') permission: string,
  ): Promise<{ hasPermission: boolean }> {
    const userPermissions = req.user.permissions || [];
    const hasPermission = userPermissions.includes(permission);
    
    return { hasPermission };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-permissions')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved' })
  @ApiBearerAuth()
  async getMyPermissions(@Request() req): Promise<{
    roles: string[];
    permissions: string[];
  }> {
    return {
      roles: req.user.roles || [],
      permissions: req.user.permissions || [],
    };
  }
} 